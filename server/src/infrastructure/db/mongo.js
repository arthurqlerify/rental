import { MongoClient } from 'mongodb';
import config from '../../config/index.js';

const client = new MongoClient(config.db.uri, {
  useUnifiedTopology: true,
});

let db;

async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db(); // Uses DB name from URI
  }
  return db;
}

const mongoAdapter = {
  insert: async (collection, item) => {
    const db = await getDb();
    await db.collection(collection).insertOne(item);
    return item;
  },

  findAll: async (collection) => {
    const db = await getDb();
    return await db.collection(collection).find({}).toArray();
  },

  findById: async (collection, id) => {
    const db = await getDb();
    return await db.collection(collection).findOne({ id });
  },

  update: async (collection, id, updates) => {
    const db = await getDb();
    const res = await db.collection(collection).findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return res.value;
  },

  remove: async (collection, id) => {
    const db = await getDb();
    const res = await db.collection(collection).deleteOne({ id });
    return res.deletedCount > 0;
  },
};

export default mongoAdapter;
