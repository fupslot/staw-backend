import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export default function errorHandler(): ErrorRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error) {
      console.error(error);
    }

    res.sendStatus(500);
  };
}
