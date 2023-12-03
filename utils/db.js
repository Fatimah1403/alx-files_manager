const { MongoClient } = require('mongodb');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const dbName = process.env.DB_DATABASE || 'files_manager';
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
}
const dbClient = new DBClient();
export default dbClient;
