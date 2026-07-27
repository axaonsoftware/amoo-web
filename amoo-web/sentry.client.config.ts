import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console
  // while setting up Sentry.
  debug: false,

  // Automatically capture Next.js routers to add route info to events
  // replaysSessionSampleRate and replaysOnErrorSampleRate are only relevant
  // if you've opted in to the Session Replay SDK.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.5 : 1.0,
});
