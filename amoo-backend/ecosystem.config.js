module.exports = {
  apps: [
    {
      name: "amoo-backend",
      script: "src/server.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      max_memory_restart: "512M",

      // Give the graceful-shutdown handler in server.js room to drain in-flight
      // requests, flush telemetry and close the DB pool before PM2 SIGKILLs.
      kill_timeout: 12000,
      // Wait for the app to signal readiness rather than assuming it after
      // spawn, so a reload does not route traffic at a process that has not
      // connected to MySQL yet.
      listen_timeout: 10000,

      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
        // CRITICAL: with `instances: "max"` PM2 forks one process per CPU core,
        // and node-cron runs IN-PROCESS — so `expire-subscriptions` fired
        // simultaneously on every worker. On an 8-core host that is 8 concurrent
        // runs of a job that UPDATEs subscriptions and downgrades user roles,
        // racing each other on the same rows.
        //
        // PM2 sets NODE_APP_INSTANCE to the worker ordinal; server.js starts the
        // scheduler only on worker 0. See cron/index.js.
        CRON_ENABLED: "true",
      },
    },
  ],
};
