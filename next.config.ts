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

              // Scripts (equilibrio seguro Next.js)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

              // Estilos
              "style-src 'self' 'unsafe-inline'",

              // Imágenes
              "img-src 'self' data: blob: https:",

              // Fuentes
              "font-src 'self' data: https:",

              // APIs externas (CRÍTICO para Supabase)
              "connect-src 'self' https://*.supabase.co https://supabase.co",

              // Iframes (YouTube controlado)
              "frame-src 'self' https://www.youtube.com",

              // Protección clickjacking moderna
              "frame-ancestors 'self'",

              // Formularios seguros
              "form-action 'self'",

              // Refuerzo HTTPS real
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;