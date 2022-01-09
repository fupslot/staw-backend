import express, { Express } from "express";
import helmet from "helmet";

import { IAppContext } from "../context";
import { errorHandler } from "./errorHandler";
import { OAuth2 } from "../oauth2";

export const createHttpServer = (context: IAppContext): Express => {
  const app = express();

  app.set("trust proxy", true);
  app.disable("x-powered-by");

  app.use(helmet());

  /**
   * GET /health
   *
   * Returns the health of the service.The API endpoint handler performs various checks, such as:
   *  - the status of the connections to the infrastructure services used by the service instance
   *  - the status of the host, e.g. disk space
   *  - application specific logic
   */
  app.get("/health", (req, res) => res.sendStatus(200)); // simple healthcheck

  /**
   * Initializing the authorization server endpoints
   */
  app.use(OAuth2(context));

  app.use(errorHandler());

  return app;
};
