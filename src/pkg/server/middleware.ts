import { format as fmt } from "util";
import { Request, RequestHandler } from "express";

export function siteId(): RequestHandler {
  return (req: Request, res, next) => {
    const hostname = req.hostname;
    const parts = req.hostname.split(".");

    if (parts.length < 3) {
      return next(
        new Error(`Hostname ${hostname}. Expecting 3rd-level domain name`)
      );
    }

    req.context = { reqId: fmt("%s", Date.now()) };
    req.context.siteId = parts.shift() || null;

    next();
  };
}
