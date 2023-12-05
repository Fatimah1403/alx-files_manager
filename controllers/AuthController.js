import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const EX = 24 * 60 * 60;

export default class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ eeror: 'Unauthorized' });
      return;
    }

    // check if the header starts with Basic, follow by space.
    const startWithBasic = req.headers.authorization.startsWith('Basic ');
    if (!startWithBasic) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get a token.
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check for the validity of user token
    const userToken = await dbClient.UserTokenChecks(token);
    if (!userToken) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // create a new Token
    const genNewToken = uuidv4();
    const authKey = `autth_${genNewToken}`;
    const userId = userToken._id;
    try {
      await redisClient.set(authKey, userId.toString(), EX);
    } catch (error) {
      res.status(500).json({ error: 'Error stting Redis key' });
      return;
    }
    res.status(200).json({ token: genNewToken });
  }

  static async getDisconnect(req, res) {
    const token = req.get('X-Token');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // Delete the token from Redis.
    const key = `auth_${token}`;
    const userID = await redisClient.get(key); // need to check this later
    if (!userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await dbClient.getUserById(userID);
    if (!user) {
      res.status({ error: 'Unauthorized' });
      return;
    }
    await redisClient.del(key);
    res.status(204).end();
  }
}
