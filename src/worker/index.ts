interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface R2Bucket {
  head(key: string): Promise<unknown | null>;
}

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  DB?: D1Database;
  FILES?: R2Bucket;
  ASSETS: AssetsBinding;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function health(env: Env): Promise<Response> {
  if (!env.DB || !env.FILES) {
    return json(
      {
        ok: false,
        configured: false,
        message: "D1/R2 ainda não foram provisionados. Execute scripts/provision.sh.",
      },
      503,
    );
  }

  try {
    const meta = await env.DB.prepare("SELECT value FROM app_meta WHERE key = ?")
      .bind("schema_version")
      .first<{ value: string }>();
    await env.FILES.head("__motor_calculo_healthcheck__");

    return json({
      ok: true,
      configured: true,
      schemaVersion: meta?.value ?? "unknown",
      storage: "r2-bound",
    });
  } catch (error) {
    return json(
      {
        ok: false,
        configured: true,
        message: error instanceof Error ? error.message : "Falha ao verificar bindings.",
      },
      500,
    );
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/health") {
      return health(env);
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "Endpoint não encontrado." }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
