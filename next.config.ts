import type { NextConfig } from "next";

const nextConfig: any = {
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  // @ts-ignore - Moved to top level in Next 15+
  outputFileTracingIncludes: {
    '/api/generate-pdf': ['./node_modules/@sparticuz/chromium/bin/*'],
  },
};

export default nextConfig;
