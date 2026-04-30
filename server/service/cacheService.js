const redisClient = require('../config/redisSetUp');
const redis = redisClient();

const KEYS = (service, use, email) => `User:${email}:${service}:${use}`;


const userCache = {
   
    saveUser: async (email, service, use, userData) => {
        const key = KEYS(service, use, email);
        await redis.set(key, JSON.stringify(userData), 'EX', 3600); 
    },

    getUser: async (service, use, email) => {
        const key = KEYS(service, use, email);
        const resp = await redis.get(key); // returns the string
        
        if (!resp) {
            return null;
        }
        
        try {
            return JSON.parse(resp); // converts string back to JS object
        } catch (e) {
            console.error("Redis parse error:", e);
            return null;
        }
    },

    clearUser: async (service, use, email) => {
        await redis.del(KEYS(service, use, email));
    },
};

module.exports = { userCache, KEYS };