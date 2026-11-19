/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [{ source: "/pocket", destination: "/pocket/index.html" }];
  },
};

export default nextConfig;
