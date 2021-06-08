import { Request, Response, NextFunction } from "express";

type AsynCallback<RequestType, ResponseType> = (
  req: RequestType,
  res: ResponseType,
  next: NextFunction
) => Promise<void>;

export const wrap = <RequestType = Request, ResponseType = Response>(
  fn: AsynCallback<RequestType, ResponseType>
) => {
  return (req: RequestType, res: ResponseType, next: NextFunction): void => {
    fn.call(null, req, res, next).catch(next);
  };
};

export function printJSON(value: Record<string, unknown>): void {
  console.log(JSON.stringify(value, null, 2));
}
