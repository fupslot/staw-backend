import * as os from "os";
import { Db } from "mongodb";

export interface IAppContext {
  pid: number;
  hostname: string;
  store: Db;
}

export interface IContextProviders {
  store: Db;
}

export function createContext(opts: IContextProviders): Promise<IAppContext> {
  const context: IAppContext = {
    pid: process.pid,

    hostname: os.hostname(),

    store: opts.store,
  };

  return Promise.resolve(context);
}
