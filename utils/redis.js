// import { tryCatch } from 'bull/lib/utils';
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
    constructor() {
        this.client = createClient();
        this.client.on('error', (err) => console.log(err));
        this.connected = false;
        this.client.on('connect', () => {
            this.connected = true;
        })
    }
    isAlive() {
        if (this.connected) {
            return true;
        } else {
            return false;
        }
    }

    async get(key) {
        const getAsync = promisify(this.client.get).bind(this.client);
        try {
            const value = await getAsync(key);
            return value;
        } catch (error) {
            console.error(error);
            throw err;
        }
    }

    async set(key, value, duration) {
      try {
        const result = await this.client.set(key, duration, value);
        return result
      } catch (err) {
        console.error(err);
        throw err;
      }  
    }

    async del(key) {
        const delAsync = promisify(this.client.del).bind(this.client);
        try {
            const delResult = await delAsync(key);
            return delResult;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

const redisClient = new RedisClient();
module.exports = redisClient;