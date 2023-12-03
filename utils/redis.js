import { createClient } from 'redis';

const util = require('util');

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.getAsync = util.promisify(this.client.get).bind(this.client);
    this.client.setExAsync = util.promisify(this.client.setex).bind(this.client);
    this.client.delAsync = util.promisify(this.client.del).bind(this.client);

    this.client.on('error', (err) => {
      console.error(`Redis client not connected to the server: ${err}`);
    });
  }

  isAlive() {
    if (this.client.connected) {
      return true;
    }
    return false;
  }

  async get(key) {
    try {
      const value = await this.client.getAsync(key);
      return value;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async set(key, value, duration) {
    try {
      const result = await this.client.setExAsync(key, duration, value);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async del(key) {
    try {
      const delResult = await this.client.delAsync(key);
      return delResult;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
