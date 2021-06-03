import { createLogger } from "./pkg/logger";
import { createApiServer } from "./pkg/api/server";
import { createContext, IAppCache } from "./pkg/context";
import { createAppStore } from "./pkg/store";
import { createCache, ICacheType } from "./pkg/cache";
import { initMailService } from "./pkg/mail";
import { config } from "./pkg/config";

const logger = createLogger();

/**
 * This function runs first
 *
 * @returns void
 */
export const main = async (): Promise<void> => {
  const store = await createAppStore();
  const cache: IAppCache = {
    site: createCache({ db: ICacheType.Site }),
  };

  // Initializing email service
  //
  // The service used to send transactional emails
  const email = initMailService();

  // Initializing application context object
  //
  // The context carries references to modules and data structures
  // across API boundaries
  const context = await createContext({ store, cache, email });

  // Initializing http server and bind it to a localhost
  //
  // The general concept is to have the nodejs listening
  // requests on localhost and nginx seating on a public interface and
  // redirecting requests to nodejs app.

  const app = createApiServer(context);
  app.listen(config.PORT, () =>
    logger.info(`Listening on port ${config.PORT}`)
  );
};

main().catch(logger.error);
