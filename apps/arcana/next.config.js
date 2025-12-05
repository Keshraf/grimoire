/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@nexus/core"],
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
