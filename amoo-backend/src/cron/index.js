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
 * It runs once in the Docker container; see below for multi-replica caveats.
 */
/**
 * Decide whether THIS process should own the scheduler.
 *
 * node-cron runs in-process. If the app is ever started with multiple
 * clustered workers, each worker is a full copy of the app, so without this
 * guard the expiry job would fire once per worker — several concurrent runs
 * racing on the same subscription and user rows.
 *
 * A scheduler master is identified via NODE_APP_INSTANCE (worker 0 takes the
 * job), and any horizontally-scaled deployment should set CRON_ENABLED=false
 * on all but one replica. (A multi-host deployment needs a real distributed
 * lock or an external scheduler — noted in the README.)
 */
function shouldRunCron() {
  if (process.env.NODE_ENV === "test") return false;
  if (process.env.CRON_ENABLED === "false") return false;
  const instance = process.env.NODE_APP_INSTANCE;
  if (instance !== undefined && instance !== "0") return false;
  return true;
}

function startCron(jobs) {
  if (!shouldRunCron()) {
    logger.info(
      `[cron] Not the scheduler process (NODE_ENV=${process.env.NODE_ENV}, ` +
        `NODE_APP_INSTANCE=${process.env.NODE_APP_INSTANCE ?? "unset"}, ` +
        `CRON_ENABLED=${process.env.CRON_ENABLED ?? "unset"}) — skipping cron start`
    );
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

module.exports = { startCron, shouldRunCron, SCHEDULE };
