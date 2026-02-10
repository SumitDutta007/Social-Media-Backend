const { cache } = require('../config/redis');

/**
 * Cache middleware for GET requests
 * @param {number} expiresIn - Cache expiration time in seconds (default: 300s = 5min)
 */
const cacheMiddleware = (expiresIn = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query params
    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get cached data
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.status(200).json(cachedData);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        // Cache the response data
        cache.set(cacheKey, data, expiresIn).catch(err => {
          console.error('Error caching response:', err);
        });

        // Send the response
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };
};

/**
 * Clear cache by pattern
 * Usage: await clearCache('posts:*') - clears all posts cache
 */
const clearCache = async (pattern) => {
  try {
    await cache.delPattern(`cache:*${pattern}*`);
    console.log(`🗑️ Cache cleared for pattern: ${pattern}`);
  } catch (err) {
    console.error('Error clearing cache:', err);
  }
};

/**
 * Clear specific cache key
 */
const clearCacheKey = async (key) => {
  try {
    await cache.del(`cache:${key}`);
    console.log(`🗑️ Cache cleared for key: ${key}`);
  } catch (err) {
    console.error('Error clearing cache key:', err);
  }
};

module.exports = { cacheMiddleware, clearCache, clearCacheKey };
