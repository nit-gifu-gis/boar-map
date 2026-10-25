import { withSentryConfig } from '@sentry/nextjs/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  // @/* is resolved from tsconfig.json by Next.js.
};

export default withSentryConfig(nextConfig, {
  org: 'boar-map',
  project: 'boar-map',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  release: {
    name: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    create: Boolean(process.env.SENTRY_AUTH_TOKEN),
    finalize: Boolean(process.env.SENTRY_AUTH_TOKEN),
  },
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  webpack: {
    treeshake: { removeDebugLogging: true },
  },
});
