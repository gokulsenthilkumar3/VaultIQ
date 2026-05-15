/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/VaultIQ',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
