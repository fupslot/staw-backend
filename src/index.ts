import { createLogger } from "./pkg/logger";
import { createHttpServer } from "./pkg/http";
import { createContext, IAppCache } from "./pkg/context";
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
  const context = await createContext({ cache, email });

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
