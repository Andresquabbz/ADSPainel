import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// ─── 1. OWASP Security Headers & Force HTTPS (HSTS) ──────────────────────────
const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();

  const applyHeaders = (headers: Headers) => {
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("X-XSS-Protection", "1; mode=block");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  };

  if (result instanceof Response) {
    applyHeaders(result.headers);
    return result;
  }

  if (
    result != null &&
    typeof result === "object" &&
    "headers" in result &&
    result.headers instanceof Headers
  ) {
    applyHeaders(result.headers);
  }

  return result;
});

// ─── 2. Error Page Middleware ────────────────────────────────────────────────
const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// ─── 3. CSRF Protection Middleware ──────────────────────────────────────────
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [securityHeadersMiddleware, errorMiddleware, csrfMiddleware],
}));
