import * as os from 'os'

export interface IAppContext {
  pid: number
  hostname: string
}

export function createContext(): Promise<IAppContext> {

  const context: IAppContext = {
    pid: process.pid,

    hostname: os.hostname()
  }

  return Promise.resolve(context)
}