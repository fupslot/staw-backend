import * as os from "os";
import { RedisAsync } from "../cache";
import { config, IAppConfig } from "../config";
import { IMailService } from "../mail";
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
  email: IMailService;
  config: IAppConfig;
}

export interface IAppContextProviders {
  // store: IAppStore;
  cache: IAppCache;
  email: IMailService;
}

export function createContext(
  opts: IAppContextProviders
): Promise<IAppContext> {
  const context: IAppContext = {
    pid: process.pid,

    hostname: os.hostname(),

    store: prisma,

    cache: opts.cache,

    email: opts.email,

    config,
  };

  return Promise.resolve(context);
}
