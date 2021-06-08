import { Router } from "express";
import { IAppContext } from "../../context";
import { createAuthoriseRoute } from "./authorize";

export function createOAuth2Route(ctx: IAppContext): Router {
  const oauth = Router();

  oauth.use("/:authz", createAuthoriseRoute(ctx));

  return oauth;
}
