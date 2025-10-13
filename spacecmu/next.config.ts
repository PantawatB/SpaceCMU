import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // allow example.com used in test payloads
      { protocol: 'http', hostname: 'example.com', port: '', pathname: '/**' },
      // allow backend running on localhost:3000
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000', pathname: '/**' },
      // allow common external image hosts if needed
      { protocol: 'https', hostname: '**', pathname: '/**' },
    ],
  },
};

export default nextConfig;
