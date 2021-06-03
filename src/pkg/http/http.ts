import express from "express";
import { IAppContext } from "../context";
import { createApiRoute } from "../api";
import { subdomain } from "./middleware";
import { errorHandler } from "./errorHandler";
import { createAuthRoute } from "../auth";

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

  // app.set('query parser', 'extended')

  // Define global middlewares
  app.use(subdomain(context));

  /**
   * GET /health
   *
   * Returns the health of the service.The API endpoint handler performs various checks, such as:
   *  - the status of the connections to the infrastructure services used by the service instance
   *  - the status of the host, e.g. disk space
   *  - application specific logic
   */
  app.get("/health", (req, res) => res.sendStatus(200)); // simple healthcheck

  app.use("/api/v1", createApiRoute(context));
  app.use(createAuthRoute(context));

  app.use(errorHandler());

  return {
    context,
    listen: (port, cb) => {
      app.listen(port, cb);
    },
  };
};
