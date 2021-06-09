import { Router } from "express";
import { IAppContext } from "../../context";
import { createAuthoriseRoute } from "./authorize";
import { createTokenRoute } from "./token";

export function createOAuth2Route(ctx: IAppContext): Router {
  const oauth = Router();

  oauth.use("/:authz", createAuthoriseRoute(ctx));
  oauth.use("/:authz", createTokenRoute(ctx));

  return oauth;
}
