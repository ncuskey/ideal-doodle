/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve static files from the project root
  async rewrites() {
    return [
      {
        source: '/assets/:path*',
        destination: '/assets/:path*',
      },
    ];
  },
};

export default nextConfig;
