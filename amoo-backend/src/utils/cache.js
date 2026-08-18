// Bounded in-memory cache with TTL, backed by LRU eviction.
// Swap the implementation in production for a real Redis client
// (ioredis / redis) without changing the calling code.
const { LRUCache } = require("lru-cache");

class Cache {
  constructor(ttlMs = 60_000, max = 1000) {
    this.ttlMs = ttlMs;
    this.store = new LRUCache({ max, ttl: ttlMs, allowStale: false });
  }

  set(key, value, ttlMs) {
    this.store.set(key, value, { ttl: ttlMs ?? this.ttlMs });
  }

  get(key) {
    return this.store.get(key);
  }

  delete(key) {
    this.store.delete(key);
  }

  has(key) {
    return this.store.has(key);
  }

  clear() {
    this.store.clear();
  }
}

// Singleton used throughout the app.
const cache = new Cache();
module.exports = { cache, Cache };
