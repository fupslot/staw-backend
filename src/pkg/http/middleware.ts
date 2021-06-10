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

export function subdomain(ctx: IAppContext): RequestHandler {
  return wrap(async (req: Request, res, next) => {
    const siteAlias = req.subdomains.shift() || null;

    req.siteAlias = siteAlias;

    const protocol = req.protocol;
    const host = req.get("host");

    req.endpoint = {
      SITE_BASE_URL: fmt("%s://%s", protocol, host),
      SIGN_IN_URL: fmt("%s://%s/sign-in", protocol, host),
      INVITE_FAIL_URL: fmt("%s://%s/invite/fail%s", protocol, host),
    };

    if (typeof siteAlias === "string") {
      // Note: Should probably cache {site} object. LRU?
      req.site = await ctx.store.site.findUnique({
        where: { alias: siteAlias },
      });
    }

    next();
  });
}

export function subdomain_required(): RequestHandler {
  return (req: Request, res, next) => {
    const hostname = req.hostname;

    if (!("site" in req)) {
      return next(
        Boom.badRequest(
          fmt("Expecting 3rd-level domain name and got %s", hostname)
        )
      );
    }

    next();
  };
}

export function x_form_www_urlencoded_required(): RequestHandler {
  return (req, res, next) => {
    if (!req.is("application/x-www-form-urlencoded")) {
      return next(
        Boom.badRequest(
          "Invalid request: expecting content-type 'application/x-www-form-urlencoded'"
        )
      );
    }

    next();
  };
}

export const json = (strict = true): RequestHandler => expressJson({ strict });
export const urlencoded = (extended = true): RequestHandler =>
  expressUrlencoded({ extended });
