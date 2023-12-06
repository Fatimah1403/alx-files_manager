const { MongoClient, ObjectId } = require('mongodb');
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
      const credentials = Buffer.from(token, 'base64').toString().split(':');
      if (credentials.length !== 2) {
        return null;
      }
      const [email, password] = credentials;
      const result = await this.checkUserPassword(email, password);
      return result;
    } catch (error) {
      console.error('UserTokenChecks Error:', error);
      return { error: 'Internal Server Error' };
    }
  }

  // check user by their Id
  async getUserById(userId) {
    try {
      const userCollection = this.db.collection('users');
      const objId = new ObjectId(userId);
      const userResult = await userCollection.findOne({ _id: objId });

      if (userResult) {
        return userResult;
      }
      return null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // we get to get the parent folder.
  async getTheParent(parentId, usersObj) {
    const userCollection = this.db.collection('files');
    const objId = new ObjectId(parentId);
    const userID = new ObjectId(usersObj._id);
    const results = await userCollection.findOne({ _id: objId, userId: userID });
    return results;
  }

  // checking weda a file exist or not in d db.
  async checkFileExist(file) {
    const userCollection = this.db.collection('files');
    const result = await userCollection.findOne({ file });
    return result;
  }

  // creating a new file in d database.
  async createNewFile(newObj) {
    try {
      const userCollection = this.db.collection('file');
      const result = await userCollection.insertOne(newObj);
      return result;
    } catch (error) {
      return null;
    }
  }
}
const dbClient = new DBClient();
export default dbClient;
