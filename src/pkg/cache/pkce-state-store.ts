import { PKCEState } from "../oauth2/crypto/token";
import { AbstractStore, object2string, string2object } from "./abstract-store";

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
