# ---- Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Deterministic install. The previous `npm ci || npm install` fallback silently
# resolved a DIFFERENT dependency tree than the lockfile pins whenever ci
# failed — defeating the point of committing a lockfile, and in this project
# specifically it would drop the `overrides` that patch the sharp/postcss CVEs.
RUN npm ci

# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so this
# must be the real production API origin, not the localhost default. It also
# feeds the connect-src directive of the CSP in next.config.ts — a wrong value
# here means the browser blocks every API call at runtime.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- Runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Tini reaps zombies and forwards SIGTERM so `docker stop` shuts down cleanly.
RUN apk add --no-cache tini wget

# `output: "standalone"` emits a self-contained server plus a minimal
# node_modules; static/ and public/ are NOT included and must be copied.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# SECURITY: this image previously ran as root.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
