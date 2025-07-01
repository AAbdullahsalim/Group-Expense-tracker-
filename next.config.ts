/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Removed experimental turbo config as it's causing issues
}

module.exports = nextConfig