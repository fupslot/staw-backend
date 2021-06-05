import * as os from "os";
import { RedisAsync } from "../cache";
import { config, IAppConfig } from "../config";
import { worker } from "../worker";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export interface IAppCache {
  site: RedisAsync;
}

export interface IAppContext {
  pid: number;
  hostname: string;
  store: typeof prisma;
  cache: IAppCache;
  worker: typeof worker;
  config: IAppConfig;
}

export interface IAppContextProviders {
  cache: IAppCache;
}

export function createContext(
  opts: IAppContextProviders
): Promise<IAppContext> {
  const context: IAppContext = {
    pid: process.pid,

    hostname: os.hostname(),

    store: prisma,

    cache: opts.cache,

    config,

    worker,
  };

  return Promise.resolve(context);
}
