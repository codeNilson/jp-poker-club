import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Adicione a configuração allowedDevOrigins aqui
  allowedDevOrigins: ['127.0.0.1'],
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: '1277.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'xxxx.supabase.co',
        port: '',
        pathname: '/images/**',
      }
    ],
  },
};

export default nextConfig;