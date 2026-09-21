param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$WorkerName = 'motor-calculo-eng-civil'
$D1Name = 'motor-calculo-eng-civil-db'
$R2Name = 'motor-calculo-eng-civil-files'
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

function Strip-Ansi([string]$Text) {
  if ($null -eq $Text) { return '' }
  $escapePattern = [string][char]27 + '\[[0-9;?]*[ -/]*[@-~]'
  [regex]::Replace($Text, $escapePattern, '')
}

function ConvertFrom-LooseJson([string]$Text) {
  $clean = (Strip-Ansi $Text).Trim()
  try { return $clean | ConvertFrom-Json } catch {}

  $arrayStart = $clean.IndexOf('[')
  $objectStart = $clean.IndexOf('{')
  $start = -1
  if ($arrayStart -ge 0 -and $objectStart -ge 0) { $start = [Math]::Min($arrayStart, $objectStart) }
  elseif ($arrayStart -ge 0) { $start = $arrayStart }
  elseif ($objectStart -ge 0) { $start = $objectStart }
  if ($start -lt 0) { throw 'Saída JSON não encontrada.' }

  $clean.Substring($start) | ConvertFrom-Json
}

function Find-JsonItemByName([object]$Value, [string]$Name) {
  if ($null -eq $Value) { return $null }
  if ($Value -is [System.Array]) {
    foreach ($item in $Value) {
      $found = Find-JsonItemByName $item $Name
      if ($null -ne $found) { return $found }
    }
    return $null
  }

  $props = @($Value.PSObject.Properties.Name)
  if ($props -contains 'name' -and [string]$Value.name -eq $Name) { return $Value }
  foreach ($container in @('result','results','items','databases','buckets')) {
    if ($props -contains $container) {
      $found = Find-JsonItemByName $Value.$container $Name
      if ($null -ne $found) { return $found }
    }
  }
  $null
}

function Ensure-CloudflareLogin([string]$NpxCmd) {
  $probe = Invoke-NativeCapture $NpxCmd @('--yes','wrangler@4','whoami')
  if ($probe.ExitCode -eq 0 -and $probe.Output -notmatch '(?i)not logged|not authenticated|login required') {
    Write-Host 'Cloudflare autenticado.' -ForegroundColor Green
    return
  }

  Step 'Autenticação Cloudflare'
  Write-Host 'O navegador será aberto para autorizar esta máquina.'
  Invoke-NativeChecked 'wrangler login' $NpxCmd @('--yes','wrangler@4','login') | Out-Null
}

function Get-D1ByName([string]$NpxCmd, [string]$Name) {
  $list = Invoke-NativeChecked 'wrangler d1 list' $NpxCmd @('--yes','wrangler@4','d1','list','--json')
  $parsed = ConvertFrom-LooseJson $list.Output
  Find-JsonItemByName $parsed $Name
}

function Test-R2Exists([string]$NpxCmd, [string]$Name) {
  $json = Invoke-NativeCapture $NpxCmd @('--yes','wrangler@4','r2','bucket','list','--json')
  if ($json.ExitCode -eq 0) {
    try {
      $parsed = ConvertFrom-LooseJson $json.Output
      if ($null -ne (Find-JsonItemByName $parsed $Name)) { return $true }
    } catch {}
  }

  $text = Invoke-NativeChecked 'wrangler r2 bucket list' $NpxCmd @('--yes','wrangler@4','r2','bucket','list')
  $text.Output -match [regex]::Escape($Name)
}

Require-Command git.exe
Require-Command node.exe
Require-Command npm.cmd
Require-Command npx.cmd

$GitCmd = (Get-Command git.exe -ErrorAction Stop).Source
$NodeCmd = (Get-Command node.exe -ErrorAction Stop).Source
$NpmCmd = (Get-Command npm.cmd -ErrorAction Stop).Source
$NpxCmd = (Get-Command npx.cmd -ErrorAction Stop).Source
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ConfigPath = Join-Path $RepoRoot $ConfigRelative

if (-not (Test-Path $ConfigPath)) { throw "Configuração ausente: $ConfigPath" }

Push-Location $RepoRoot
try {
  Step 'Validando checkout e pré-requisitos'
  $dirty = Invoke-NativeChecked 'git status' $GitCmd @('status','--porcelain','--untracked-files=no')
  if (-not [string]::IsNullOrWhiteSpace($dirty.Output)) {
    throw 'Existem alterações Git não commitadas. Faça commit/stash antes do provisionamento.'
  }

  Invoke-NativeChecked 'node --version' $NodeCmd @('--version') | Out-Null
  Invoke-NativeChecked 'npm --version' $NpmCmd @('--version') | Out-Null
  Ensure-CloudflareLogin $NpxCmd

  Step 'Instalando dependências locais'
  Invoke-NativeChecked 'npm install' $NpmCmd @('install','--no-audit','--no-fund','--package-lock=false') | Out-Null

  Step "Verificando D1 exclusivo: $D1Name"
  $configRaw = [IO.File]::ReadAllText($ConfigPath)
  $d1 = Get-D1ByName $NpxCmd $D1Name
  if ($null -ne $d1) {
    if ($configRaw -notmatch ('"database_name"\s*:\s*"' + [regex]::Escape($D1Name) + '"')) {
      throw "Já existe um D1 chamado '$D1Name', mas ele não está vinculado a este projeto. O script não adota recursos desconhecidos."
    }
    Write-Host 'D1 já pertence a este projeto; preservando binding.' -ForegroundColor Green
  } else {
    Invoke-NativeChecked 'criação do D1' $NpxCmd @('--yes','wrangler@4','d1','create',$D1Name,'--binding','DB','--update-config','--config',$ConfigRelative) | Out-Null
  }

  Step "Verificando R2 exclusivo: $R2Name"
  $configRaw = [IO.File]::ReadAllText($ConfigPath)
  if (Test-R2Exists $NpxCmd $R2Name) {
    if ($configRaw -notmatch ('"bucket_name"\s*:\s*"' + [regex]::Escape($R2Name) + '"')) {
      throw "Já existe um R2 chamado '$R2Name', mas ele não está vinculado a este projeto. O script não adota buckets desconhecidos."
    }
    Write-Host 'R2 já pertence a este projeto; preservando binding.' -ForegroundColor Green
  } else {
    Invoke-NativeChecked 'criação do R2' $NpxCmd @('--yes','wrangler@4','r2','bucket','create',$R2Name,'--binding','FILES','--update-config','--config',$ConfigRelative) | Out-Null
  }

  Step 'Aplicando migrations no D1 remoto'
  Invoke-NativeChecked 'D1 migrations' $NpxCmd @('--yes','wrangler@4','d1','migrations','apply','DB','--remote','--config',$ConfigRelative) | Out-Null

  Step 'Validando projeto'
  Invoke-NativeChecked 'npm test' $NpmCmd @('test') | Out-Null
  Invoke-NativeChecked 'npm run typecheck' $NpmCmd @('run','typecheck') | Out-Null
  Invoke-NativeChecked 'npm run build' $NpmCmd @('run','build') | Out-Null

  Step 'Publicando Worker + Static Assets'
  Invoke-NativeChecked 'wrangler deploy' $NpxCmd @('--yes','wrangler@4','deploy','--config',$ConfigRelative) | Out-Null

  $configDiff = Invoke-NativeCapture $GitCmd @('diff','--quiet','--',$ConfigRelative)
  if ($configDiff.ExitCode -eq 1) {
    Write-Host "`nO Wrangler adicionou IDs/bindings ao $ConfigRelative." -ForegroundColor Yellow
    Write-Host 'Para persistir os bindings no GitHub:'
    Write-Host '  git.exe add wrangler.jsonc; git.exe commit -m "chore: bind Cloudflare resources"; git.exe push'
  } elseif ($configDiff.ExitCode -ne 0) {
    throw "Não foi possível verificar alterações em $ConfigRelative."
  }

  Write-Host "`nProvisionamento concluído: $WorkerName.<seu-subdominio>.workers.dev" -ForegroundColor Green
  Write-Host 'Abra /api/health na URL publicada pelo Wrangler para confirmar D1/R2.'
} finally {
  Pop-Location
}
