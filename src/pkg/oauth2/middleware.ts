import {
  RequestHandler,
  urlencoded as expressUrlencoded,
  json as expressJson,
} from "express";
import { TokenResponseError } from "./token";

export function x_form_www_urlencoded_required(): RequestHandler {
  return (req, res, next) => {
    if (!req.is("application/x-www-form-urlencoded")) {
      return next(new TokenResponseError("invalid_request"));
    }

    next();
  };
}

export const json = (strict = true): RequestHandler => expressJson({ strict });
export const urlencoded = (extended = true): RequestHandler =>
  expressUrlencoded({ extended });
