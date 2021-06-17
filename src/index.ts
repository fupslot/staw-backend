import { createLogger } from "./pkg/logger";
import { createHttpServer } from "./pkg/http";
import { createContext } from "./pkg/context";
import { PKCEStateStore, IStoreCache } from "./pkg/cache";
import { config } from "./pkg/config";

const logger = createLogger();

/**
 * This function runs first
 *
 * @returns void
 */
export const main = async (): Promise<void> => {
  const storeCache: IStoreCache = {
    pkceStore: new PKCEStateStore(config.CACHE_OAUTH_STATE_URL, {
      // This option indicates how long the state will be valid (in seconds)
      stateLifetimeSec: 60,
    }),
  };

  // Initializing email service
  //
  // The service used to send transactional emails
  // const email = initMailService();

  // Initializing application context object
  //
  // The context carries references to modules and data structures
  // across API boundaries
  const context = await createContext({ storeCache });

  // Initializing http server and bind it to a localhost
  //
  // The general concept is to have the nodejs listening
  // requests on localhost and nginx seating on a public interface and
  // redirecting requests to nodejs app.

  const app = createHttpServer(context);
  app.listen(config.PORT, () =>
    logger.info(`Listening on port ${config.PORT}`)
  );
};

main().catch(logger.error);
