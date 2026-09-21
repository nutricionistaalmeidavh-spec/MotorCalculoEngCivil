param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$ConfigRelative = 'wrangler.jsonc'

function Step([string]$Text) {
  Write-Host "`n==> $Text" -ForegroundColor Cyan
}

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando obrigatório não encontrado: $Name"
  }
}

function Invoke-NativeCapture([string]$FilePath, [string[]]$Arguments) {
  $old = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    $output = (& $FilePath @Arguments 2>&1 | Out-String)
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
  } finally {
    $ErrorActionPreference = $old
  }
  [pscustomobject]@{ ExitCode = $exitCode; Output = $output }
}

function Invoke-NativeChecked([string]$Label, [string]$FilePath, [string[]]$Arguments) {
  $result = Invoke-NativeCapture $FilePath $Arguments
  if ($result.ExitCode -ne 0) {
    throw "$Label falhou (exit $($result.ExitCode)).`n$($result.Output)"
  }
  if (-not [string]::IsNullOrWhiteSpace($result.Output)) {
    Write-Host $result.Output.TrimEnd()
  }
  $result
}

function Ensure-CloudflareLogin([string]$NpxCmd) {
  $probe = Invoke-NativeCapture $NpxCmd @('--yes','wrangler@4','whoami')
  if ($probe.ExitCode -eq 0 -and $probe.Output -notmatch '(?i)not logged|not authenticated|login required') {
    Write-Host 'Cloudflare autenticado.' -ForegroundColor Green
    return
  }
  Step 'Autenticação Cloudflare'
  Invoke-NativeChecked 'wrangler login' $NpxCmd @('--yes','wrangler@4','login') | Out-Null
}

Require-Command git.exe
Require-Command node.exe
Require-Command npm.cmd
Require-Command npx.cmd

$NpmCmd = (Get-Command npm.cmd -ErrorAction Stop).Source
$NpxCmd = (Get-Command npx.cmd -ErrorAction Stop).Source
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ConfigPath = Join-Path $RepoRoot $ConfigRelative

if (-not (Test-Path $ConfigPath)) { throw "Configuração ausente: $ConfigPath" }
$configRaw = [IO.File]::ReadAllText($ConfigPath)
if ($configRaw -notmatch '"binding"\s*:\s*"DB"' -or $configRaw -notmatch '"binding"\s*:\s*"FILES"') {
  throw 'D1/R2 ainda não estão vinculados. Execute scripts\provision.ps1 primeiro.'
}

Push-Location $RepoRoot
try {
  Step 'Instalando dependências'
  Invoke-NativeChecked 'npm install' $NpmCmd @('install','--no-audit','--no-fund','--package-lock=false') | Out-Null

  Step 'Validando Cloudflare'
  Ensure-CloudflareLogin $NpxCmd

  Step 'Aplicando migrations D1'
  Invoke-NativeChecked 'D1 migrations' $NpxCmd @('--yes','wrangler@4','d1','migrations','apply','DB','--remote','--config',$ConfigRelative) | Out-Null

  Step 'Executando gates locais'
  Invoke-NativeChecked 'npm test' $NpmCmd @('test') | Out-Null
  Invoke-NativeChecked 'npm run typecheck' $NpmCmd @('run','typecheck') | Out-Null
  Invoke-NativeChecked 'npm run build' $NpmCmd @('run','build') | Out-Null

  Step 'Publicando Worker + Static Assets'
  Invoke-NativeChecked 'wrangler deploy' $NpxCmd @('--yes','wrangler@4','deploy','--config',$ConfigRelative) | Out-Null

  Write-Host "`nDeploy concluído. Use a URL *.workers.dev exibida pelo Wrangler." -ForegroundColor Green
  Write-Host 'Validação adicional: abra /api/health.'
} finally {
  Pop-Location
}
