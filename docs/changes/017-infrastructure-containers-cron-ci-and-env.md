# 017 — Container, cron, CI and environment hardening

- **Category**: Config / Security / Bug Fix
- **Severity**: High
- **File(s) affected**:
  - `amoo-backend/Dockerfile`, `amoo-web/Dockerfile`
  - `amoo-backend/docker-compose.yml`
  - `amoo-backend/ecosystem.config.js`, `amoo-backend/src/cron/index.js`
  - `amoo-backend/src/config/telemetry.js`, `amoo-backend/src/server.js`
  - `amoo-backend/.env.example`
  - `.github/workflows/ci.yml`

## 17a. Both containers ran as root; neither had a healthcheck

### Problem

Neither Dockerfile dropped privileges. A container escape, or RCE through any
dependency, would have started as **root**. Neither declared a `HEALTHCHECK`, so
an orchestrator could not tell a wedged container from a healthy one or hold
traffic off one that was still starting. Neither used an init process, so
`docker stop` sent SIGTERM to PID 1 — where node does not install default
handlers — meaning the carefully-written graceful shutdown in `server.js` was
skipped and the process was SIGKILLed after the timeout, dropping in-flight
requests.

Two more specific problems in the backend image:

```dockerfile
RUN npm ci --omit=dev || npm install --omit=dev
RUN npm run migrate || true
```

- **`npm ci || npm install`** silently resolves a *different* dependency tree
  than the lockfile pins whenever `ci` fails. That defeats the purpose of
  committing a lockfile — and on the frontend it would drop the `overrides` that
  patch the sharp/postcss CVEs (change 013).
- **`npm run migrate` at build time** runs in the builder stage, where no
  database exists. It always failed, and `|| true` hid it. The migration then
  also ran on start, so the build-time copy was pure noise masking a real error.

### Solution

Non-root (`USER node`), `tini` as the init process, a `HEALTHCHECK` hitting
`/api/health` (which probes the database), deterministic `npm ci`, and
migrations only at container start where a real failure stops the deploy.

`/app/uploads` is created and `chown`ed before dropping privileges, or the first
upload fails with `EACCES`.

### Before / After

```diff
-RUN npm ci --omit=dev || npm install --omit=dev
-COPY . .
-RUN npm run migrate || true
+RUN npm ci --omit=dev
...
+RUN apk add --no-cache tini wget
+RUN mkdir -p /app/uploads && chown -R node:node /app
+USER node
+HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
+  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/api/health || exit 1
+ENTRYPOINT ["/sbin/tini", "--"]
 CMD ["sh", "-c", "node src/migrate.js && node src/server.js"]
```

---

## 17b. `docker-compose.yml` could never start in production, and published MySQL

### Problem

The file sets `NODE_ENV: production` but supplied **no payment configuration**.
`config/env.js` refuses to boot in that state, by design:

```js
if (env.isProd && env.payments.gateway === "mock") {
  throw new Error("PAYMENT_GATEWAY must not be 'mock' in production. ...");
}
if (env.isProd && !env.payments.webhookSecret) {
  throw new Error("PAYMENT_WEBHOOK_SECRET is required in production");
}
```

So `docker compose up` crash-looped the backend immediately. The file was
untested against its own stated purpose.

Separately:

```yaml
ports:
  - "3306:3306"
```

published MySQL on **all host interfaces**, with the root password taken from
the same `.env`. On any host without a firewall that is the database exposed to
the network. The `backend` service reaches it over the compose network by
service name and never needed the published port.

The healthcheck `mysqladmin ping -h localhost` also passed without
authenticating, so it reported healthy before MySQL was actually ready for
authenticated connections.

Finally, `./uploads:/app/uploads` is a host bind mount — which, now that the
container runs as unprivileged `node`, lands root-owned and breaks every upload.

### Solution

All required production variables passed through with `:?` guards, MySQL's port
unpublished (with a commented loopback-only option for local access), an
authenticated healthcheck with a `start_period`, and a **named volume** for
uploads.

### Before / After

```diff
     environment:
       NODE_ENV: production
       ...
       CLIENT_ORIGIN: ${CLIENT_ORIGIN:-http://localhost:3000}
+      CLIENT_URL: ${CLIENT_URL:-}
+      PAYMENT_GATEWAY: ${PAYMENT_GATEWAY:?PAYMENT_GATEWAY must be razorpay or stripe in production}
+      PAYMENT_WEBHOOK_SECRET: ${PAYMENT_WEBHOOK_SECRET:?PAYMENT_WEBHOOK_SECRET is required in production}
+      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID:-}
+      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET:-}
```
```diff
   db:
-    ports:
-      - "3306:3306"
+    # SECURITY: port no longer published to the host.
+    # ports:
+    #   - "127.0.0.1:3306:3306"
     healthcheck:
-      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
+      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-p${DB_PASSWORD}"]
+      start_period: 30s
```
```diff
   backend:
     volumes:
-      - ./uploads:/app/uploads
+      - amoo_uploads:/app/uploads
 volumes:
   amoo_db_data:
+  amoo_uploads:
```

---

## 17c. PM2 cluster mode ran the cron job once per CPU core

### Problem

```js
instances: "max",
exec_mode: "cluster",
```

PM2 forks one process per core, and each is a **complete copy of the app** —
including `startCron()`, which schedules `expireSubscriptions` with in-process
`node-cron`. On an 8-core host the job fired **8 times simultaneously** at 02:00,
each run executing:

```sql
UPDATE subscriptions SET status = 'expired' WHERE id IN (?)
UPDATE users SET role = 'free' WHERE id IN (?) AND role != 'free' AND id NOT IN (...)
```

against the same rows. The `expired` update is idempotent, but the concurrent
role downgrade races its own `NOT IN (SELECT ... WHERE status='active')`
subquery: eight readers can each observe a different intermediate state, so a
user whose subscription is being expired in one worker can be downgraded by
another before their remaining active subscription is visible. It also produced
8× the DB load and 8 duplicate audit entries per night.

### Solution

A `shouldRunCron()` guard. PM2 sets `NODE_APP_INSTANCE` to the worker ordinal,
so only worker `0` owns the scheduler.

```js
function shouldRunCron() {
  if (process.env.NODE_ENV === "test") return false;
  if (process.env.CRON_ENABLED === "false") return false;
  const instance = process.env.NODE_APP_INSTANCE;
  if (instance !== undefined && instance !== "0") return false;
  return true;
}
```

`kill_timeout: 12000` was also added, so the 10-second graceful-shutdown window
in `server.js` can complete before PM2 escalates.

Verified:
```
PASS {}                            -> true
PASS {"NODE_APP_INSTANCE":"0"}     -> true
PASS {"NODE_APP_INSTANCE":"1"}     -> false
PASS {"NODE_APP_INSTANCE":"7"}     -> false
PASS {"CRON_ENABLED":"false"}      -> false
PASS {"NODE_ENV":"test"}           -> false
```

---

## 17d. Optional tracing was a hard boot dependency

### Problem

`server.js` line 2 is `require("./config/telemetry")`, and that module
`require`d five `@opentelemetry/*` packages at the top level. When two of them
were missing from `node_modules`, the **entire API failed to start**:

```
Error: Cannot find module '@opentelemetry/sdk-trace-node'
    at Object.<anonymous> (src/config/telemetry.js:4:32)
```

An unreachable service because a *telemetry exporter* was absent. Observability
is optional infrastructure and must degrade, not gate the application.

Two related issues: the `ConsoleSpanExporter` was enabled for **all** non-production
runs, dumping a multi-line span object per request (it buried the test output
entirely), and the OTLP exporter used `SimpleSpanProcessor`, which issues one
HTTP request per span synchronously rather than batching.

### Solution

Everything loads inside `try/catch`; failure logs one warning and the app
serves traffic normally. Console spans became opt-in
(`OTEL_CONSOLE_EXPORTER=true`), tracing is off in tests, and the OTLP exporter
uses `BatchSpanProcessor`. A `shutdownTelemetry()` flush was wired into the
graceful-shutdown path so spans from the last requests before a deploy are not
lost.

```diff
-const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");   // top level
-provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));  // all non-prod
-provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter(...)));
+try {
+  provider = start();        // all requires inside
+} catch (err) {
+  console.warn(`[telemetry] disabled — tracing failed to initialise (${err.message}). ...`);
+  provider = null;
+}
```
```diff
-module.exports = provider;                       // null when disabled
+module.exports = { provider, shutdownTelemetry, enabled: provider !== null };
```

---

## 17e. CI never ran lint or touched a database

### Problem

The frontend job ran only `npm ci && npm run build && npm test`, where `npm
test` was `echo ... && exit 0`. **Lint was never run**, which is how the
codebase accumulated 400+ violations unnoticed. Nothing type-checked
independently, and nothing ever ran the migrations — so the class of bug in
change 009 (a `schema.sql` missing columns the code writes to) could ship twice
without CI noticing.

### Solution

- Frontend: explicit `tsc --noEmit`, **`npm run lint`**, then build.
- Backend: a real **MySQL 8 service container**; CI now runs `npm run migrate`
  and boots `server.js` against it, so a schema/code mismatch fails the build.
- Both: `npm audit --omit=dev --audit-level=high`, gating on runtime CVEs while
  ignoring dev-only advisories that cannot reach production.

---

## 17f. `.env.example` was incomplete and unclear about what is mandatory

`CLIENT_URL`, `CRON_ENABLED`, `OTEL_*` were undocumented; nothing distinguished
"nice to set" from "the server will refuse to boot". Rewritten with a
`[PROD REQUIRED]` marker on each boot-blocking value, an explanation of *why*
each guard exists, and a production checklist — including the non-obvious one:
auth cookies are `SameSite=None; Secure` in production and are **silently
dropped over plain HTTP**.

## Testing notes

```bash
# cron guard (shown above)
node -e "const {shouldRunCron}=require('./src/cron/index'); ..."

# backend still green with the telemetry rewrite
npm test                      # 73/73
NODE_ENV=test node -e "require('./src/server.js'); console.log('OK')"

# tracing genuinely optional — the failure mode that motivated the change
mv node_modules/@opentelemetry /tmp/otel-backup
node -e "require('./src/server.js'); console.log('boots without OTel')"
# => "[telemetry] disabled — tracing failed to initialise (...)" then boots
mv /tmp/otel-backup node_modules/@opentelemetry
```

Container checks (require Docker, not run here):
```bash
docker build -t amoo-backend ./amoo-backend
docker run --rm amoo-backend id          # => uid=1000(node) — not root
docker inspect --format '{{.Config.Healthcheck.Test}}' amoo-backend

# compose must now refuse to start without payment config, rather than crash-loop
cd amoo-backend && docker compose up
# => "PAYMENT_GATEWAY must be razorpay or stripe in production"
```

## Risk / impact

- **Non-root is a breaking change for existing volumes.** A host directory
  previously written by the root-running container is root-owned; the `node`
  user cannot write to it. Either `chown -R 1000:1000 ./uploads` on the host, or
  migrate to the named volume this compose file now uses. **Check this before
  redeploying if you have existing uploads.**
- **`npm ci` fails on a lockfile/package.json mismatch** instead of silently
  installing something else. That is the point, but it will surface any drift
  the old fallback was hiding.
- **CI is now stricter and will fail on the current tree** until the remaining
  lint violations are cleared (in progress — change 018). That is intentional:
  the gate has to exist before it can be met.
- **`CRON_ENABLED`/`NODE_APP_INSTANCE` only solves single-host scaling.** Across
  multiple hosts every host has a worker 0. A multi-host deployment needs a
  distributed lock (a `SELECT ... FOR UPDATE` sentinel row) or an external
  scheduler. Flagged in the final report.
- **The compose file is for local and staging.** For production, point `DB_HOST`
  at managed MySQL and do not run the database in compose at all.
