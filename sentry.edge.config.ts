// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b4d7ef67962e40889b75d5b5b6779e38@o4505520793780224.ingest.sentry.io/4505534484512768",

  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "local",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "none",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
