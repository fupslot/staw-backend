import * as os from "os";
import { Db } from "mongodb";
import { RedisAsync } from "../cache";

export interface IAppCache {
  site: RedisAsync;
}

export interface IAppContext {
  pid: number;
  hostname: string;
  store: Db;
  cache: IAppCache;
}

export interface IAppContextProviders {
  store: Db;
  cache: IAppCache;
}

export function createContext(
  opts: IAppContextProviders
): Promise<IAppContext> {
  const context: IAppContext = {
    pid: process.pid,

    hostname: os.hostname(),

    store: opts.store,

    cache: opts.cache,
  };

  return Promise.resolve(context);
}
