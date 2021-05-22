import express from "express";
import { IAppContext } from "../context";
import { createProfileRouter } from "../profile";
import { siteId } from "./middleware";
import errorHandler from "./errorHandler";

interface HTTPServer {
  listen: (port: number, cb: () => void) => void;
}

export interface HTTPServerWithContext extends HTTPServer {
  context: IAppContext;
}

export const createServer = (context: IAppContext): HTTPServerWithContext => {
  const app = express();

  // Define global middlewares
  app.use(siteId());

  app.get("/api/v1", (req, res) => res.sendStatus(200)); // simple healthcheck
  app.use("/api/v1/profile", createProfileRouter(context));

  app.use(errorHandler());

  return {
    context,
    listen: (port, cb) => {
      app.listen(port, cb);
    },
  };
};
