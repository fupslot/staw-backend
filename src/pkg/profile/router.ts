import { Router } from "express";
import { IAppContext } from "pkg/context";
import { wrap } from "../../internal/util";

export function createProfileRouter(ctx: IAppContext): Router {
  const profile = Router();

  profile.get(
    "/",
    wrap(async (req, res) => {
      const count = await ctx.store.collection("Site").countDocuments();

      res.status(200);
      res.json({ site: req.context.site, count });
    })
  );

  profile.post(
    "/",
    wrap(async (req, res) => {
      res.sendStatus(200);
    })
  );

  return profile;
}
