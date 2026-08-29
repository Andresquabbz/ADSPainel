import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      let actualRequest = request;
      try {
        const url = new URL(request.url);
        const host = url.hostname.toLowerCase();
        const rootDomain = "adspainel.site";

        // Subdomain routing: if accessing <slug>.adspainel.site, route to /s/<slug>
        if (host.endsWith(`.${rootDomain}`)) {
          const subdomain = host.slice(0, -(rootDomain.length + 1));
          const reserved = ["www", "app", "api", "admin", "mail", "cdn", "preview"];
          if (subdomain && !reserved.includes(subdomain)) {
            if (url.pathname === "/" || url.pathname === "") {
              const rewrittenUrl = new URL(`/s/${subdomain}${url.search}`, url.origin);
              actualRequest = new Request(rewrittenUrl.toString(), {
                method: request.method,
                headers: request.headers,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error in subdomain routing:", err);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(actualRequest, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);

      // ── Inject OWASP Security Headers & Force HTTPS (HSTS) ────────────────
      normalized.headers.set("X-Content-Type-Options", "nosniff");
      normalized.headers.set("X-Frame-Options", "SAMEORIGIN");
      normalized.headers.set("X-XSS-Protection", "1; mode=block");
      normalized.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      normalized.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
      normalized.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=*"
      );
      normalized.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );

      return normalized;
    } catch (error) {
      console.error(error);
      const errorResp = new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      errorResp.headers.set("X-Content-Type-Options", "nosniff");
      errorResp.headers.set("X-Frame-Options", "SAMEORIGIN");
      return errorResp;
    }
  },
};
