const { MongoClient } = require('mongodb');
const sha1 = require('sha1');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const dbName = process.env.DB_DATABASE || 'files_manager';
console.log(dbName);
const url = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.init();
  }

  async init() {
    try {
      await this.client.connect();
      this.db = this.client.db(dbName);
    } catch (error) {
      console.error(`Connection error: ${error}`);
      throw error;
    }
  }

  isAlive() {
    if (this.client.isConnected()) {
      return true;
    }
    return false;
  }

  async nbUsers() {
    try {
      const userCollection = this.db.collection('users');
      const userResult = await userCollection.countDocuments();
      return userResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async nbFiles() {
    try {
      const fileCollection = this.db.collection('files');
      const fileResult = await fileCollection.countDocuments();
      return fileResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addNewUser(email, password) {
    try {
      const userCollection = this.db.collection('users');
      const hashedPassword = sha1(password);
      const userObj = { email, password: hashedPassword };
      const userResult = await userCollection.insertOne(userObj);
      return userResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // check if the email of the user already exist.
  async checkEmail(email) {
    const userCollection = this.db.collection('users');
    const userResult = await userCollection.findOne({ email });
    if (userResult) {
      return userResult;
    }
    return null;
  }

  async checkUserPassword(email, password) {
    const userCollection = this.db.collection('users');
    const hashedPassword = sha1(password);
    const result = await userCollection.findOne({ email, password: hashedPassword });
    return result;
  }

  // check weda the credentials base on Token
  async UserTokenChecks(token) {
    try {
      const credentials = (Buffer.from(token.split(' ')[1], 'base64').toString('utf-8'));
      const [email, password] = credentials.split(':');
      if (email && password) {
        const result = await this.checkUserPassword(email, password);
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getUserById(userId) {
    try {
      const userCollection = this.db.collection('users');
      const userResult = await userCollection.findOne({ _id: userId });

      if (userResult) {
        return userResult;
      }
      return null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
const dbClient = new DBClient();
export default dbClient;
