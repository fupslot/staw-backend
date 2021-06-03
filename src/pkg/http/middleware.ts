import { format as fmt } from "util";
import {
  Request,
  RequestHandler,
  urlencoded as expressUrlencoded,
  json as expressJson,
} from "express";
import { IAppContext } from "../context";
import { wrap } from "../../internal/util";
import Boom from "@hapi/boom";

/**
 * Middleware examples:
 *
 * http.use(site())
 * http.use(site_required())
 */

export function subdomain(ctx: IAppContext): RequestHandler {
  return wrap(async (req: Request, res, next) => {
    const siteId = req.subdomains.shift() || null;

    if (siteId) {
      /**
       * Note:
       *  1. should try fetch site data from the database;
       *  2. should cache site data. LRU?
       */
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

export function subdomain_required(): RequestHandler {
  return (req, res, next) => {
    if (!req.context.siteId) {
      return next(
        Boom.badRequest(
          fmt("Expecting 3rd-level domain name and got %s", req.hostname)
        )
      );
    }

    next();
  };
}

export const json = (strict = true): RequestHandler => expressJson({ strict });
export const urlencoded = (extended = true): RequestHandler =>
  expressUrlencoded({ extended });
