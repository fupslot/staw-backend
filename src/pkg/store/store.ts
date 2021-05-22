import { MongoClient, Db, MongoClientOptions } from "mongodb";
import config from "../config";

export async function createStore(): Promise<Db> {
  const options: MongoClientOptions = {
    useUnifiedTopology: true,
  };

  if (config.STORE_LOGGER) {
    options.logger = console;
  }

  const client = await MongoClient.connect(config.STORE_URL, options);
  const db = client.db(config.STORE_DB);

  return db;
}
