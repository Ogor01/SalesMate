/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
};

// Sentry integration — only wraps if SENTRY_DSN is set
let userConfig = nextConfig;
try {
  const { withSentryConfig } = require("@sentry/nextjs");
  if (process.env.SENTRY_DSN) {
    userConfig = withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    });
  }
} catch {
  // @sentry/nextjs not installed — skip
}

module.exports = userConfig;
