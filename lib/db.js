import { MongoClient } from 'mongodb'

const globalForMongo = globalThis

export async function getDb() {
  if (!globalForMongo._rhDb) {
    const client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    globalForMongo._rhClient = client
    globalForMongo._rhDb = client.db(process.env.DB_NAME)
  }
  return globalForMongo._rhDb
}
