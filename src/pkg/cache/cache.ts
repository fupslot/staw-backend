import Redis from "ioredis";
import { object2string, string2object, PKCEStateObject } from "../../internal";

class GeneralStore {
  private _store: Redis.Redis;

  constructor(url: string) {
    this._store = new Redis(url);
  }

  get store() {
    return this._store;
  }

  close() {
    this._store.disconnect();
  }
}

export class OAuthStateStore extends GeneralStore {
  /**
   * Store 'state' value with TTL 60 sec
   * @param code
   */
  async saveState(code: PKCEStateObject): Promise<"OK"> {
    return this.store.setex(code.state, 30, object2string(code));
  }

  async getState(state: string): Promise<PKCEStateObject | null> {
    const data = await this.store.get(state);
    await this.store.del(state);
    if (data) {
      return string2object(data) as PKCEStateObject;
    }

    return null;
  }
}
