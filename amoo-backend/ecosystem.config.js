module.exports = {
  apps: [
    {
      name: "amoo-backend",
      script: "src/server.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      // Run migrations before the app starts (PM2 will exit 0 if already applied).
      // For a clean boot, run `node src/migrate.js` once during deploy instead.
    },
  ],
};
