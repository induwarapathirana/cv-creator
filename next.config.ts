import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  // @ts-ignore - outputFileTracingIncludes is stable in Next 15+ but types may lag
  outputFileTracingIncludes: {
    '/api/generate-pdf': ['./node_modules/@sparticuz/chromium/bin/*'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  },
};

export default nextConfig;
