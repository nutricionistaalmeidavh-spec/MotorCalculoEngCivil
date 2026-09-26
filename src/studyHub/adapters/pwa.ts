import { createCachePlan, type CachePlan } from "../../../vendor/artisys/pwa-runtime/index.mjs";

export type PwaUiStatus = "registrando" | "ativo" | "indisponível" | "falhou";

export function createMotorCachePlan(): CachePlan {
  return createCachePlan({
    prefix: "motor-calculo",
    version: "2",
    offlineFallback: "/",
    shell: [
      "/",
      "/manifest.webmanifest",
      "/icon-192.png",
      "/icon-512.png",
      "/vendor/jsxgraph.css",
      "/study/calculo1-demo.pdf",
      "/python-packages/mpmath-1.3.0-py3-none-any.whl",
      "/python-packages/sympy-1.14.0-py3-none-any.whl",
      "/pyodide/pyodide.mjs",
    ],
  });
}

export async function resolvePwaRegistration(options: { navigator?: Navigator; swUrl?: string } = {}): Promise<PwaUiStatus> {
  const nav = options.navigator ?? globalThis.navigator;
  if (!nav || !("serviceWorker" in nav) || !nav.serviceWorker?.register) return "indisponível";
  try {
    await nav.serviceWorker.register(options.swUrl ?? "/sw.js");
    if (nav.serviceWorker.ready) await nav.serviceWorker.ready;
    return "ativo";
  } catch {
    return "falhou";
  }
}
