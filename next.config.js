/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Pour déploiement statique
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
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
