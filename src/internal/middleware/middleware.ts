import {
  urlencoded as expressUrlencoded,
  json as expressJson,
  RequestHandler,
} from "express";

export const json = (strict = true): RequestHandler => expressJson({ strict });
export const urlencoded = (extended = true): RequestHandler =>
  expressUrlencoded({ extended });
