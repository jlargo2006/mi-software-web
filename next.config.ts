import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",

              // Scripts (Next.js necesita unsafe-eval en dev/build runtime)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

              // Estilos
              "style-src 'self' 'unsafe-inline'",

              // Imágenes (local + Supabase + data URIs)
              "img-src 'self' data: blob: https:",

              // Fuentes
              "font-src 'self' data: https:",

              // Conexiones externas (CRÍTICO para Supabase)
              "connect-src 'self' https://*.supabase.co https://supabase.co",

              // Iframes (YouTube)
              "frame-src 'self' https://www.youtube.com",

              // Seguridad anti clickjacking moderna (mejor que X-Frame-Options)
              "frame-ancestors 'self'",

              // Formularios
              "form-action 'self'",

              // Reduce ataques MIME sniffing
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;