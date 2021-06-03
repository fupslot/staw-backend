import { Request, Response, NextFunction, RequestHandler } from "express";

export interface Dictionary<T> {
  [key: string]: T;
}

export type ParamsDictionary = Dictionary<string>;
export type ParamsArray = string[];

export type QueryParams = ParamsDictionary;
export type Params = ParamsDictionary | ParamsArray;
export type ResBody = unknown;
export type ReqBody = unknown;
export type ReqQuery = unknown;
export type Locals = Record<string, unknown>;

type AsyncRequestHandler<
  T,
  TT = ResBody,
  TTT = ReqBody,
  TTTT = ReqQuery,
  TTTTT = Locals
> = (
  req: Request<T, TT, TTT, TTTT, TTTTT>,
  res: Response<TT, TTTTT>,
  next: NextFunction
) => Promise<void>;

export function wrap<
  T extends ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
  Locals = Record<string, unknown>
>(
  fn: AsyncRequestHandler<T, ResBody, ReqBody, ReqQuery, Locals>
): RequestHandler<T, ResBody, ReqBody, ReqQuery, Locals> {
  return (req, res, next) => fn.call(null, req, res, next).catch(next);
}
