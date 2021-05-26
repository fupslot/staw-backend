import { Router } from "express";
import { IAppContext } from "pkg/context";
import { createProfileRouter } from "../profile";
import { createSignInRouter } from "../sign-in";

export function createApiRoute(ctx: IAppContext): Router {
  const api: Router = Router();

  api.use(createSignInRouter(ctx));
  api.use(createProfileRouter);

  return api;
}
