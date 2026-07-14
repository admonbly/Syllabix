/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Empêche le site d'être intégré dans une iframe (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Empêche le navigateur de deviner le type MIME
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Force HTTPS pendant 1 an
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Désactive le referrer vers des sites externes
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Désactive les API sensibles inutiles (caméra, micro, géoloc)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Content Security Policy — bloque les scripts/styles non autorisés
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://www.google.com https://www.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.resend.com wss://*.firebaseio.com",
              "frame-src 'self' https://syllabix-e6f20.firebaseapp.com https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Anciens slugs d'articles → nouveaux équivalents
      { source: '/blog/ia-chat-gpt-2024',         destination: '/blog/ia-emploi-afrique-2026',              permanent: true },
      { source: '/blog/securite-biometrique',      destination: '/blog/cybersecurite-pme-afrique',           permanent: true },
      { source: '/blog/power-bi-formation',        destination: '/blog/bureautique-excel-pme-afrique',       permanent: true },
      { source: '/blog/marque-digitale-linkedin',  destination: '/blog/freelance-numerique-afrique',         permanent: true },
      { source: '/blog/recherche-ia',              destination: '/blog/ia-emploi-afrique-2026',              permanent: true },
      { source: '/blog/travail-hybride',           destination: '/blog/freelance-numerique-afrique',         permanent: true },
    ];
  },
};

export default nextConfig;
