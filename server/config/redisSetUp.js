const { Redis } = require('ioredis');

let client;

const getRedisClient = () => {
  // Disable Redis in test OR when not configured
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.REDIS_HOST === 'NONE'
  ) {
    return {
      get: async () => null,
      set: async () => null,
      del: async () => null,
      ttl: async () => -1,
      incr: async () => 1,
      expire: async () => null,
      multi: () => ({
        hset: () => this,
        expire: () => this,
        exec: async () => null
      }),
    };
  }

  if (!client) {
    client = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });
  }
  
  return client;
};

module.exports = getRedisClient;