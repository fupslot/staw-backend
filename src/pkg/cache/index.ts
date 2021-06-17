export * from "./pkce-state";
import { PKCEStateStore } from "./pkce-state";

export interface IStoreCache {
  pkceStore: PKCEStateStore;
}
