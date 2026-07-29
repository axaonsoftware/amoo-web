// Simple in-memory cache with TTL. Used as a drop-in when Redis
// is not available — swap the implementation in production for a real
// Redis client (ioredis / redis) without changing the calling code.

class Cache {
  constructor(ttlMs = 60_000) {
    this.ttlMs = ttlMs;
    this.store = new Map();
    this.cleanupInterval = setInterval(() => this._sweep(), 30_000).unref();
  }

  set(key, value, ttlMs) {
    const expiresAt = Date.now() + (ttlMs ?? this.ttlMs);
    this.store.set(key, { value, expiresAt });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  delete(key) {
    this.store.delete(key);
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  clear() {
    this.store.clear();
  }

  _sweep() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

// Singleton used throughout the app.
const cache = new Cache();
module.exports = { cache, Cache };