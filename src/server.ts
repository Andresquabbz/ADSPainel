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
      const url = new URL(request.url);

      // ── Mercado Pago Webhook ──────────────────────────────────────────────
      if (
        (url.pathname === "/api/mercadopago/webhook" || url.pathname === "/api/webhook/mercadopago") &&
        request.method === "POST"
      ) {
        try {
          let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
          if (!paymentId) {
            try {
              const body = (await request.clone().json()) as {
                data?: { id?: string };
                id?: string;
                type?: string;
                action?: string;
              };
              paymentId = body?.data?.id || body?.id;
            } catch {}
          }

          if (paymentId) {
            const MP_TOKEN = (process.env["MERCADO_PAGO_ACCESS_TOKEN"] || "").replace(/^['"]|['"]$/g, "");
            if (MP_TOKEN) {
              const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${MP_TOKEN}` },
              });
              if (mpRes.ok) {
                const payment = (await mpRes.json()) as {
                  id: number;
                  status: string;
                  metadata?: { user_id?: string; tokens?: number; package_slug?: string };
                };

                if (payment.status === "approved" && payment.metadata?.user_id && payment.metadata?.tokens) {
                  const SUPABASE_URL = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
                  const SUPABASE_KEY =
                    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
                    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
                    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
                  if (SUPABASE_URL && SUPABASE_KEY) {
                    const { createClient } = await import("@supabase/supabase-js");
                    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
                    await (supabase.rpc as any)("credit_tokens_for_payment", {
                      p_payment_id: String(payment.id),
                      p_user_id: payment.metadata.user_id,
                      p_tokens: Number(payment.metadata.tokens),
                      p_pkg_slug: payment.metadata.package_slug || "starter",
                    });
                    console.log(`[MercadoPago Webhook] Credited ${payment.metadata.tokens} tokens to ${payment.metadata.user_id}`);
                  }
                }
              }
            }
          }
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (webhookErr) {
          console.error("[MercadoPago Webhook] Error:", webhookErr);
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
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
