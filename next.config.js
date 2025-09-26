/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // output: "standalone",
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for postgres and other node modules that shouldn't be bundled for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        perf_hooks: false,
        os: false,
        path: false,
        stream: false,
        postgres: false,
        pg: false,
      };
      
      // Ignore server-only packages entirely on client-side
      config.externals = config.externals || [];
      config.externals.push('postgres', 'pg', 'drizzle-orm/postgres-js');
    }
    
    return config;
  },
};

export default config;
