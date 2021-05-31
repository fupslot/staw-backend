import { Router } from "express";
import { IAppContext } from "../../pkg/context";
import { createSignInRouter } from "../../pkg/api/sign-in";
import { createInviteRoute } from "../../pkg/api/invite";

export function createApiRoute(ctx: IAppContext): Router {
  const api: Router = Router();

  api.use(createSignInRouter(ctx));
  api.use(createInviteRoute(ctx));

  return api;
}
