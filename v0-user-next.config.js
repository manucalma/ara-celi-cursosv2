/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["iframe.mediadelivery.net"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Aumentar el tiempo de timeout para la generación estática
  staticPageGenerationTimeout: 180,
  // Configuración para manejo de errores
  onDemandEntries: {
    // Periodo (en ms) donde las páginas se mantienen en buffer
    maxInactiveAge: 60 * 60 * 1000,
    // Número de páginas que se mantienen en memoria
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig

