import { format as fmt } from "util";
import {
  Request,
  RequestHandler,
  urlencoded as expressUrlencoded,
  json as expressJson,
} from "express";
import Boom from "@hapi/boom";

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
