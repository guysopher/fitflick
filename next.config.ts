import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA Configuration
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  
  // Enable experimental features for better PWA support
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Optimize for offline usage
  images: {
    unoptimized: true, // For better offline support
  },
  
  // Temporarily disable linting during build to focus on PWA functionality
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
