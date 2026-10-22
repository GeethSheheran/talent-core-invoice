import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
    "unpdf",
    "mammoth",
  ],
  outputFileTracingIncludes: {
    "/api/**/*": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./public/brand/**/*",
      "./src/app/globals.css",
    ],
  },
  poweredByHeader: false,
};
export default config;
