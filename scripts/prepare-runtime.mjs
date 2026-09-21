import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pyodideSource = join(root, "node_modules", "pyodide");
const pyodideTarget = join(root, "public", "pyodide");
const wheelsTarget = join(root, "public", "python-packages");

const packages = [
  { name: "mpmath", version: "1.4.1" },
  { name: "sympy", version: "1.14.0" },
];

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function preparePyodide() {
  if (!(await exists(join(pyodideSource, "pyodide.mjs")))) {
    throw new Error("Pacote pyodide não encontrado. Execute npm install primeiro.");
  }

  await rm(pyodideTarget, { recursive: true, force: true });
  await mkdir(dirname(pyodideTarget), { recursive: true });
  await cp(pyodideSource, pyodideTarget, { recursive: true });
}

async function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function downloadWheel({ name, version }) {
  const metadataResponse = await fetch(`https://pypi.org/pypi/${name}/${version}/json`);
  if (!metadataResponse.ok) {
    throw new Error(`Não foi possível consultar ${name} ${version} no PyPI.`);
  }

  const metadata = await metadataResponse.json();
  const wheel = metadata.urls.find(
    (file) => file.packagetype === "bdist_wheel" && file.filename.endsWith("-py3-none-any.whl"),
  );
  if (!wheel) {
    throw new Error(`Wheel puro Python não encontrado para ${name} ${version}.`);
  }

  const destination = join(wheelsTarget, wheel.filename);
  if (await exists(destination)) {
    const current = await readFile(destination);
    if ((await sha256(current)) === wheel.digests.sha256) return;
  }

  const response = await fetch(wheel.url);
  if (!response.ok) {
    throw new Error(`Falha no download de ${wheel.filename}.`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const digest = await sha256(buffer);
  if (digest !== wheel.digests.sha256) {
    throw new Error(`Checksum inválido para ${wheel.filename}.`);
  }

  await writeFile(destination, buffer);
}

await preparePyodide();
await mkdir(wheelsTarget, { recursive: true });
for (const pkg of packages) {
  await downloadWheel(pkg);
}
