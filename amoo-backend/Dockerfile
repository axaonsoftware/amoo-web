# ---- Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# `npm ci` is deterministic and fails loudly on a lockfile mismatch. The
# previous `npm ci || npm install` fallback silently resolved a DIFFERENT
# dependency tree than the lockfile pins whenever ci failed — which defeats the
# point of committing a lockfile and can ship untested transitive versions.
RUN npm ci --omit=dev

# ---- Runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Tini reaps zombies and forwards SIGTERM to node, so the graceful-shutdown
# handler in server.js actually runs on `docker stop` instead of being SIGKILLed.
RUN apk add --no-cache tini wget

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
COPY .env.example ./.env.example
COPY README.md ./README.md

# Uploads are written at runtime; create the directory with the right owner
# before dropping privileges, or the first upload fails with EACCES.
RUN mkdir -p /app/uploads && chown -R node:node /app

# SECURITY: the image previously ran as root. A container escape or an RCE in a
# dependency would then have had root on the host namespace. `node` is an
# unprivileged user the base image already provides.
USER node

VOLUME ["/app/uploads"]
EXPOSE 4000

# Lets the orchestrator restart a wedged container and hold traffic off a
# starting one. /api/health also probes the database.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]

# Migrations run at START, not at build. The previous image ran
# `RUN npm run migrate || true` in the builder stage, where no database exists —
# so it always failed, and `|| true` hid that. Running it here means a real
# migration failure stops the deploy instead of starting a server against a
# schema that was never applied.
#
# Retry policy: attempt migration up to 3 times with a 5s delay. If all attempts
# fail, write a sentinel and start the server anyway (degraded — health check
# will report "degraded"). This prevents an infinite restart loop when the DB is
# unreachable or a migration permanently fails, while still giving transient
# failures (DB not yet ready) a chance to recover. The sentinel is in /tmp and
# is cleared on container recreation (next deploy).
CMD ["sh", "-c", "\
  if [ -f /tmp/migration_failed ]; then \
    echo '[startup] Previous migration failed — starting in degraded mode (no DB).' ; \
    node src/server.js ; \
  else \
    ATTEMPTS=0; \
    until node src/migrate.js; do \
      ATTEMPTS=$((ATTEMPTS+1)); \
      if [ $ATTEMPTS -ge 3 ]; then \
        echo '[startup] Migration failed after 3 attempts — starting in degraded mode.' ; \
        touch /tmp/migration_failed ; \
        node src/server.js ; \
        exit 0 ; \
      fi ; \
      echo \"[startup] Migration attempt $ATTEMPTS failed, retrying in 5s...\" ; \
      sleep 5 ; \
    done ; \
    node src/server.js ; \
  fi"]
