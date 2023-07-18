// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
