const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'drizzle-orm'],
  },
};

module.exports = nextConfig;
