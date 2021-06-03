import { Boom } from "@hapi/boom";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export function errorHandler(): ErrorRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (error: Boom, req: Request, res: Response, next: NextFunction) => {
    if (error?.isBoom) {
      const responseHeaders = error.output.headers;

      for (const key in responseHeaders) {
        const value = responseHeaders[key];
        if (value) {
          res.setHeader(key, value);
        }
      }

      res.status(error.output.statusCode);

      if (error.data) {
        return res.json({
          ...error.output.payload,
          data: error.data,
        });
      }

      return res.json(error.output.payload);
    }

    console.error(error);

    res.sendStatus(500);
  };
}
