const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

// Only create Redis client if REDIS_URL is provided (production)
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.log('⚠️ Redis reconnection limit reached');
          return new Error('Redis reconnection limit reached');
        }
        return retries * 100;
      }
    }
  });

  // Handle Redis connection events
  redisClient.on('connect', () => {
    console.log('✅ Redis client connected');
    isRedisConnected = true;
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis Error:', err.message);
    isRedisConnected = false;
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis client ready to use');
    isRedisConnected = true;
  });

  // Connect to Redis
  (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      console.error('⚠️ Failed to connect to Redis:', err.message);
      console.log('📝 App will run without caching (local development mode)');
      isRedisConnected = false;
    }
  })();
} else {
  console.log('📝 Redis not configured - running in local mode without caching');
  console.log('💡 Add REDIS_URL environment variable to enable caching');
}

// Cache helper functions
const cache = {
  // Get cached data
  get: async (key) => {
    if (!isRedisConnected || !redisClient) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Redis GET error:', err.message);
      return null;
    }
  },

  // Set cache data with expiration (in seconds)
  set: async (key, value, expiresIn = 300) => {
    if (!isRedisConnected || !redisClient) return false;
    try {
      await redisClient.setEx(key, expiresIn, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error('Redis SET error:', err.message);
      return false;
    }
  },

  // Delete cached data
  del: async (key) => {
    if (!isRedisConnected || !redisClient) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (err) {
      console.error('Redis DEL error:', err.message);
      return false;
    }
  },

  // Delete multiple keys by pattern
  delPattern: async (pattern) => {
    if (!isRedisConnected || !redisClient) return false;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (err) {
      console.error('Redis DEL PATTERN error:', err.message);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    if (!isRedisConnected || !redisClient) return false;
    try {
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (err) {
      console.error('Redis EXISTS error:', err.message);
      return false;
    }
  },

  // Get TTL (time to live) of a key
  ttl: async (key) => {
    try {
      return await redisClient.ttl(key);
    } catch (err) {
      console.error('Redis TTL error:', err);
      return -1;
    }
  }
};

module.exports = { redisClient, cache };
