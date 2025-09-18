/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.stream.quest',
        port: '',
        pathname: '/assets/**',
      },
    ],
  },
};

export default nextConfig;
