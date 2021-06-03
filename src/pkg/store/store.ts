import {
  MongoClient,
  Db,
  MongoClientOptions,
  Collection,
  ObjectID,
} from "mongodb";
import { config } from "../config";

type SiteId = string | null;

interface UniqueKey {
  id?: ObjectID;
}

export interface ISiteModel extends UniqueKey {
  siteId: SiteId;
  email: string;
}

export interface IProfileModel extends UniqueKey {
  name: string;
  email: string;
  siteId: SiteId;
  createdAt: Date;
}

export interface IInviteModel extends UniqueKey {
  code: string;
  siteId: SiteId;
  expireAt: Date;
}

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

export interface IAppStore {
  site: Collection<ISiteModel>;

  profile: Collection<IProfileModel>;

  invite: Collection<IInviteModel>;
}

export async function createAppStore(): Promise<IAppStore> {
  const options: MongoClientOptions = {
    useUnifiedTopology: true,
  };

  if (config.STORE_LOGGER) {
    options.logger = console;
  }

  const client = await MongoClient.connect(config.STORE_URL, options);
  const db = client.db(config.STORE_DB);

  return {
    site: db.collection<ISiteModel>("Site"),
    profile: db.collection<IProfileModel>("Profile"),
    invite: db.collection<IInviteModel>("Invite"),
  };
}
