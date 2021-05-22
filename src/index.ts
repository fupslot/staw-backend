import { createLogger } from "./pkg/logger";
import { createServer } from "./pkg/server";
import { createContext, IAppCache } from "./pkg/context";
import { createStore } from "./pkg/store";
import { createCache, ICacheType } from "./pkg/cache";

const logger = createLogger();

/**
 * This function runs first
 *
 * @returns void
 */
export const main = async (): Promise<void> => {
  const store = await createStore();
  const cache: IAppCache = {
    site: createCache({ db: ICacheType.Site }),
  };

  // Initializing application context object
  //
  // The context carries references to modules and data structures
  // across API boundaries
  const context = await createContext({ store, cache });

  // Initializing http server and bind it to a localhost
  //
  // The general concept is to have the nodejs listening
  // requests on localhost and nginx seating on a public interface and
  // redirecting requests to nodejs app.
  const appPort = 9000;

  const app = createServer(context);
  app.listen(appPort, () => logger.info(`Listening on port ${appPort}`)); // make this configurable via config
};

main().catch(logger.error);
