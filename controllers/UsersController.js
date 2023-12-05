import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;
    console.log(email, password);
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    const testUser = await dbClient.checkEmail(email);
    if (testUser) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    const dataUser = await dbClient.addNewUser(email, password);
    res.status(201).json({ id: dataUser.insertedId, email });
  }

  static async getMe(req, res) {
    const token = req.get('X-Token');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userID = await redisClient.get(`auth_${token}`);
    if (!userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await dbClient.getUserById(userID);
    if (!user) {
      res.status({ error: 'Unauthorized' });
      return;
    }
    res.json({ id: user._id, email: user.email });
  }
}
