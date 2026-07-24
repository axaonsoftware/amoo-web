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
CMD ["sh", "-c", "node src/migrate.js && node src/server.js"]
