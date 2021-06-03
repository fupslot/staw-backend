import { Router } from "express";
import { IAppContext } from "../context";
import { createSignUpRoute } from "./sign-up";
import { createInviteRoute } from "./invite";

export function createAuthRoute(ctx: IAppContext): Router {
  const pages = Router();

  pages.use(createSignUpRoute(ctx));
  pages.use(createInviteRoute(ctx));

  return pages;
}
