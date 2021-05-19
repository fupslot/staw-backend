import { createLogger } from './pkg/logger'

const logger = createLogger()


/**
 * This function runs first
 * 
 * @returns void
 */
export const main = async(): Promise<void> => {
  return Promise.resolve();
}

main()
  .catch(logger.error)