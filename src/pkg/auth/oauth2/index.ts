import { Router } from "express";
import { IAppContext } from "../../context";
import { createAuthoriseRoute } from "./authorize";
import { createTokenRoute } from "./token";

export function createOAuth2Route(ctx: IAppContext): Router {
  const oauth = Router();

  // build oauth context object

  oauth.use("/:serverAlias", createAuthoriseRoute(ctx));
  oauth.use("/:serverAlias", createTokenRoute(ctx));

  return oauth;
}
