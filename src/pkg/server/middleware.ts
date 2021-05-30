import { format as fmt } from "util";
import { Request, RequestHandler } from "express";
import { IAppContext } from "pkg/context";
import { wrap } from "../../internal/util";

export function siteId(ctx: IAppContext): RequestHandler {
  return wrap(async (req: Request, res, next) => {
    const hostname = req.hostname;
    const siteId = req.subdomains.shift();

    if (!siteId) {
      throw new Error(`Hostname ${hostname}. Expecting 3rd-level domain name`);
    }

    req.context = { reqId: fmt("%s", Date.now()), siteId };

    if (typeof siteId === "string") {
      const data = await ctx.cache.site.get(siteId);
      if (data) {
        req.context.site = JSON.parse(data);
      }
    }

    next();
  });
}
