/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 性能优化配置
  output: 'standalone',
  // 图像优化
  images: {
    domains: ['ddxgwajcmxwiqsemnsup.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  // 压缩
  compress: true,
  // 页面优化
  optimizeFonts: true,
  // 减少初始加载大小
  experimental: {
    scrollRestoration: true,
  },
  // 构建优化
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
