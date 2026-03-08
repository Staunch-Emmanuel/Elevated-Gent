import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.bucketlistly.blog',
      },
      {
        protocol: 'https',
        hostname: 'ourlegacy.centracdn.net',
      },
      {
        protocol: 'https',
        hostname: 'poolhousenewyork.com',
      },
      {
        protocol: 'https',
        hostname: 'bananarepublic.gap.com',
      },
      {
        protocol: 'https',
        hostname: 'media.cos.com',
      },
      {
        protocol: 'https',
        hostname: 'california-arts.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

export default nextConfig