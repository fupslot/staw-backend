import { createLogger } from './pkg/logger'
import { server } from './pkg/server'
const logger = createLogger()


/**
 * This function runs first
 * 
 * @returns void
 */
export const main = async(): Promise<void> => {
  const appPort = 9000


  // Initializing http server and bind it to a localhost
  // 
  // The general concept is to have the nodejs listening 
  // requests on localhost and nginx seating on a public interface and 
  // redirecting requests to nodejs app.
  const app = server()
  app.listen(appPort, () => logger.info(`Listening on port ${appPort}`)) // make this configurable via config
}

main()
  .catch(logger.error)