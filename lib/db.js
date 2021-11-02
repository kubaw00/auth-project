import { MongoClient } from 'mongodb';

export async function connectDatabase() {
  const client = await MongoClient.connect(
    `mongodb+srv://${process.env.mongodb_key}.mongodb.net/auth-demo?retryWrites=true&w=majority`
  );
  return client;
}
