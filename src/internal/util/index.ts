import { createHash } from "crypto";
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

export function string2object(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

export function object2string(record: Record<string, unknown>): string {
  return JSON.stringify(record);
}

export function trim(value: string): string {
  return String.prototype.trim.call(value);
}

export function lowercase(value: string): string {
  return String.prototype.toLowerCase.call(value);
}

/**
 * Generates Gravatar Hash value
 *
 * @param email - email address
 * @returns string md5 hash value
 *
 * @see https://en.gravatar.com/site/implement/hash/
 */
export function createGravatarHash(email: string): string {
  return createHash("md5")
    .update(trim(lowercase(email)))
    .digest("hex");
}
