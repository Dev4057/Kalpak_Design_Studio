/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kalpak/shared', '@kalpak/db'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

export default nextConfig
