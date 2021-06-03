import { Router } from "express";
import { IAppContext } from "../../pkg/context";
import { createSignInRoute } from "../../pkg/api/sign-in";
import { createInviteRoute } from "../../pkg/api/invite";

export function createApiRoute(ctx: IAppContext): Router {
  const api: Router = Router();

  api.use(createSignInRoute(ctx));
  api.use(createInviteRoute(ctx));

  return api;
}
