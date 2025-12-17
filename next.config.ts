import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    scrollRestoration: true,
  },
  staticPageGenerationTimeout: 60,
  images: {
    domains: ['localhost'],
  },
//   async redirects() {
//     return [
//       {
//         source: "/",
//         destination: "/home",
//         permanent: false,
//       },
//     ];
//   },
};

export default nextConfig;
