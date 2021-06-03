import { Router } from "express";
import { IAppContext } from "../context";
// import { createInviteRoute } from "./invite";

export function createApiRoute(ctx: IAppContext): Router {
  const api: Router = Router();

  // api.use(createInviteRoute(ctx));

  return api;
}
