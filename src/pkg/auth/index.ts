import { Router } from "express";
import { IAppContext } from "../context";
import { createSignUpRoute } from "./sign-up";
import { createInviteRoute } from "./invite";
import { createOAuth2Route } from "./oauth2";

export function createAuthRoute(ctx: IAppContext): Router {
  const auth = Router();

  auth.use(createOAuth2Route(ctx));
  auth.use(createSignUpRoute(ctx));
  auth.use(createInviteRoute(ctx));

  return auth;
}
