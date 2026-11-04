/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Tipografías y logo que leen las imágenes de vista previa (/api/og, /api/story) en tiempo de ejecución.
    outputFileTracingIncludes: {
      '/api/og/[id]': ['./src/assets/fonts/**', './public/images/falcone.png', './public/images/tarifa.png'],
      '/api/story/[id]': ['./src/assets/fonts/**', './public/images/falcone.png', './public/images/tarifa.png'],
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: '*.imgbb.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

module.exports = nextConfig
