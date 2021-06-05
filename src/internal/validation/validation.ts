import Boom from "@hapi/boom";
import { string, object } from "yup";
import ObjectSchema, { ObjectShape } from "yup/lib/object";

export const rule = {
  NCHAR: /^[\u002D|\u002E|\u005F|\w]+$/,
  NQCHAR: /^[\u0021|\u0023-\u005B|\u005D-\u007E]+$/,
  NQSCHAR: /^[\u0020-\u0021|\u0023-\u005B|\u005D-\u007E]+$/,
  UNICODECHARNOCRLF:
    // eslint-disable-next-line no-control-regex
    /^[\u0009|\u0020-\u007E|\u0080-\uD7FF|\uE000-\uFFFD|\u{10000}-\u{10FFFF}]+$/u,
  URI: /^[a-zA-Z][a-zA-Z0-9+.-]+:/,
  VSCHAR: /^[\u0020-\u007E]+$/,
  ALPHANUM: /^[a-zA-Z0-9]+$/g,
};

const commonRegexMessage = "${path} contains invalid characters";

/**
 * Validate if a value matches a unicode character excluding the carriage
 * return and linefeed characters.
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
export const uchar = string().matches(
  rule.UNICODECHARNOCRLF,
  commonRegexMessage
);

/**
 * Validate if a value matches against the printable set of unicode characters.
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
export const vschar = string().matches(rule.VSCHAR, commonRegexMessage);

/**
 * Validate if a value matches a unicode character.
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
export const nchar = string().matches(rule.NCHAR, commonRegexMessage);

/**
 * Validate if a value matches a unicode character, including exclamation marks.
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
export const nqchar = string().matches(rule.NQCHAR, commonRegexMessage);

/**
 * Validate if a value matches a unicode character, including exclamation marks and spaces.
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
export const nqschar = string().matches(rule.NQSCHAR, commonRegexMessage);

export const alphanum = string().matches(rule.ALPHANUM, commonRegexMessage);

type ValidationResult<T> = {
  [P in keyof T]: T[P];
};

export const validate = async <T>(
  schema: ObjectSchema<ObjectShape>,
  data: T
): Promise<ValidationResult<T>> => {
  try {
    return (await schema.validate(data)) as T;
  } catch (error) {
    throw Boom.badRequest(error, error.params);
  }
};

/**
 * Schemas
 *
 * @see https://github.com/jquense/yup
 */

export const submitProfileSchema = object().shape({
  first_name: alphanum.required(),
  last_name: alphanum.required(),
  email: string().email().required(),
});

export const PostSignUpSchema = object().shape({
  siteId: string().required(),
  email: string().email().required(),
});

export const InviteParamsSchema = object().shape({
  code: alphanum,
});
