import util from "util";
import { createClient, RedisClient } from "redis";
import config from "../config";

export type CreateCacheHandlerOptions = {
  db: ICacheType;
};

export enum ICacheType {
  Site = 1,
}

export interface RedisAsync {
  get(key: string): Promise<string | null>;
  set: (key: string, value: string) => Promise<unknown>;
  setex: (key: string, seconds: number, value: string) => Promise<string>;
}

export interface CreateCacheHandler {
  (options: CreateCacheHandlerOptions): RedisAsync;
}

export const createCache: CreateCacheHandler = ({ db = 0 }): RedisAsync => {
  const client: RedisClient = createClient({
    db,
    url: config.CACHE_URL,
  });

  return {
    get: util.promisify(client.get.bind(client)),
    set: util.promisify(client.set.bind(client)),
    setex: util.promisify(client.setex.bind(client)),
  };
};
