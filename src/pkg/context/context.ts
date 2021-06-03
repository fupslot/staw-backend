import * as os from "os";
import { IAppStore } from "../store";
import { RedisAsync } from "../cache";
import { config, IAppConfig } from "../config";
import { IMailService } from "../mail";

export interface IAppCache {
  site: RedisAsync;
}

export interface IAppContext {
  pid: number;
  hostname: string;
  store: IAppStore;
  cache: IAppCache;
  email: IMailService;
  config: IAppConfig;
}

export interface IAppContextProviders {
  store: IAppStore;
  cache: IAppCache;
  email: IMailService;
}

export function createContext(
  opts: IAppContextProviders
): Promise<IAppContext> {
  const context: IAppContext = {
    pid: process.pid,

    hostname: os.hostname(),

    store: opts.store,

    cache: opts.cache,

    email: opts.email,

    config,
  };

  return Promise.resolve(context);
}
