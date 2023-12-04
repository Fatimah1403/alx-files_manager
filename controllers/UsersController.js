import dbClient from '../utils/db';
// import redisClient from '../utils/redis';

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
}
