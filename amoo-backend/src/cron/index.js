const cron = require("node-cron");
const logger = require("../utils/logger");

// node-cron syntax: minute hour day-of-month month day-of-week
// Default: "0 2 * * *" = daily at 02:00 server local time
const SCHEDULE = process.env.CRON_SCHEDULE || "0 2 * * *";

/**
 * Start the subscription expiry cron job.
 * Called once from server.js after the HTTP server starts listening.
 *
 * The job runs on an in-process timer (setInterval under the hood).
 * See the README for deployment-specific caveats (Render free tier sleep,
 * Railway restart policy, etc.).
 */
function startCron(jobs) {
  if (process.env.NODE_ENV === "test") {
    logger.info("[cron] Skipping cron start (NODE_ENV=test)");
    return;
  }

  for (const { name, schedule, task } of jobs) {
    if (!cron.validate(schedule)) {
      logger.warn(`[cron] Invalid schedule "${schedule}" for "${name}", skipping`);
      continue;
    }
    cron.schedule(schedule, async () => {
      const start = Date.now();
      logger.info(`[cron] Starting: ${name}`);
      try {
        await task();
        logger.info(`[cron] Completed: ${name} (${Date.now() - start}ms)`);
      } catch (err) {
        logger.error(`[cron] Failed: ${name}`, err.message);
      }
    });
    logger.info(`[cron] Scheduled "${name}" with cron "${schedule}"`);
  }
}

module.exports = { startCron, SCHEDULE };
