# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY . .
RUN npm run migrate || true

# ---- Runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY --from=builder /app/src ./src
COPY --from=builder /app/.env.example ./.env.example
COPY --from=builder /app/README.md ./README.md

# Persist uploaded files outside the container in production (mount a volume)
VOLUME ["/app/uploads"]

EXPOSE 4000
# Run migrations on container start, then start the server
CMD ["sh", "-c", "node src/migrate.js && node src/server.js"]
