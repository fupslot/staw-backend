import {
  NextFunction,
  Router,
  Request,
  Response,
  RequestHandler,
} from "express";
import { IAppContext } from "pkg/context";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void>;

function wrap(fn: AsyncRequestHandler): RequestHandler {
  return function (req, res, next): void {
    fn.call(null, req, res, next).catch(next);
  };
}

export function createProfileRouter(ctx: IAppContext): Router {
  const profile = Router();

  profile.get(
    "/",
    wrap(async (req, res) => {
      const count = await ctx.store.collection("Site").countDocuments();

      res.status(200);
      res.json({ siteId: req.context.siteId, count });
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
