export * from "./pkce-state-store";
import { PKCEStateStore } from "./pkce-state-store";

export interface IStoreCache {
  pkceStore: PKCEStateStore;
  // accessTokenStore: AccessTokenStore;
}
