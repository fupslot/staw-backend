import * as os from "os";
import { IStoreCache } from "../cache";
import { config, IAppConfig } from "../config";
import { worker } from "../worker";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export interface IAppContext {
  pid: number;
  hostname: string;
  store: typeof prisma;
  storeCache: IStoreCache;
  worker: typeof worker;
  config: IAppConfig;
}

export interface IAppContextProviders {
  storeCache: IStoreCache;
}

export function createContext(
  opts: IAppContextProviders
): Promise<IAppContext> {
  const context: IAppContext = {
    pid: process.pid,

    hostname: os.hostname(),

    store: prisma,

    storeCache: opts.storeCache,

    config,

    worker,
  };

  return Promise.resolve(context);
}
