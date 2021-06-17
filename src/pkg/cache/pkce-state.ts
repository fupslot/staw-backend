import Redis from "ioredis";
import { PKCEState } from "../oauth2/crypto/pkce";

function string2object(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function object2string(record: Record<string, unknown>) {
  return JSON.stringify(record);
}

abstract class AbstractStore {
  protected store: Redis.Redis;

  constructor(url: string) {
    this.store = new Redis(url);
  }

  close() {
    this.store.disconnect();
  }
}

type StateStoreOptions = {
  stateLifetimeSec: number;
};

export class PKCEStateStore extends AbstractStore {
  private options: StateStoreOptions;

  constructor(url: string, opts: StateStoreOptions) {
    super(url);

    this.options = opts;
  }

  async set(state: PKCEState): Promise<PKCEState> {
    await this.store.setex(
      state.verifier,
      this.options.stateLifetimeSec,
      object2string(state)
    );
    return state;
  }

  async get(verifier: string): Promise<PKCEState | null> {
    const data = await this.store.get(verifier);
    if (data) {
      await this.store.del(verifier);
      return string2object(data) as PKCEState;
    }

    return null;
  }
}
