import express from "express";
import helmet from "helmet";

import { IAppContext } from "../context";
import session from "../session";

// import { createApiRoute } from "../api";
// import { subdomain } from "./middleware";
import { errorHandler } from "./errorHandler";
import { OAuth2 } from "../oauth2";
import { Login } from "../login";

interface HTTPServer {
  listen: (port: number, cb: () => void) => void;
}

interface HTTPServerWithContext extends HTTPServer {
  context: IAppContext;
}

export const createHttpServer = (
  context: IAppContext
): HTTPServerWithContext => {
  const app = express();

  app.set("trust proxy", true);
  // app.set('query parser', 'extended')
  app.disable("x-powered-by");

  app.use(helmet());

  session.init(app, context);

  // Define global middlewares
  // app.use(subdomain(context));

  /**
   * GET /health
   *
   * Returns the health of the service.The API endpoint handler performs various checks, such as:
   *  - the status of the connections to the infrastructure services used by the service instance
   *  - the status of the host, e.g. disk space
   *  - application specific logic
   */
  app.get("/health", (req, res) => res.sendStatus(200)); // simple healthcheck

  // todo: implement API as child express application
  // app.use("/api/v1", createApiRoute(context));

  app.use(Login(context));

  /**
   * Initializing the authorization server endpoints
   */
  app.use(OAuth2(context));

  app.use(errorHandler());

  return {
    context,
    listen: (port, cb) => {
      app.listen(port, cb);
    },
  };
};
