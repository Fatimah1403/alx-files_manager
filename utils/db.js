const { MongoClient } = require('mongodb');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const dbName = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}/${dbName}`;


class DBClient {
    constructor() {
        this.client = new MongoClient(url, { useUnifiedTopology: true });
        this.client.connect((err) => {
            if (err) {
                console.error(`Connection error: ${err}`)
            } else {
                this.db = this.client.db(dbName);
                console.log('Connected to the database');
            }
        })
    }
    isAlive() {
        if (this.client.isConnected()) {
            return true;
        } else {
            return false;
        }
    }

    async nbUsers() {
        try {
            const userCollection = this.db.collection('users');
            const userResult = userCollection.countDocuments();
            return userResult
        } catch (error) {
            console.error(error);
        }
    }

    async nbFiles() {
        try {
            const fileCollection = this.db.collection('files');
            const fileResult = fileCollection.countDocuments();
            return fileResult;
        } catch (error) {
            console.error(error)
        }

    }
}
const dbClient = new DBClient();
export default dbClient;