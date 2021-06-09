import Boom from "@hapi/boom";
import { string, object, mixed } from "yup";
import ObjectSchema, { ObjectShape } from "yup/lib/object";

export const rule = {
  /**
   * Validate if a value matches a unicode character, including exclamation marks.
   * NQCHAR     = %x21 / %x23-5B / %x5D-7E
   *
   * @see https://tools.ietf.org/html/rfc6749#appendix-A
   */
  NQCHAR: /^[\u0021|\u0023-\u005B|\u005D-\u007E]+$/,

  /**
   * Validate if a value matches a unicode character, including exclamation marks and spaces.
   * NQSCHAR    = %x20-21 / %x23-5B / %x5D-7E
   *
   * @see https://tools.ietf.org/html/rfc6749#appendix-A
   */
  NQSCHAR: /^[\u0020-\u0021|\u0023-\u005B|\u005D-\u007E]+$/,

  /**
   * Validate if a value matches a unicode character excluding the carriage
   * return and linefeed characters.
   * UNICODECHARNOCRLF = %x09 /%x20-7E / %x80-D7FF / %xE000-FFFD / %x10000-10FFFF
   *
   * @see https://tools.ietf.org/html/rfc6749#appendix-A
   */
  UNICODECHARNOCRLF:
    // eslint-disable-next-line no-control-regex
    /^[\u0009|\u0020-\u007E|\u0080-\uD7FF|\uE000-\uFFFD|\u{10000}-\u{10FFFF}]+$/u,

  /**
   * Validate if a value matches against the printable set of unicode characters.
   * VSCHAR     = %x20-7E
   *
   * @see https://tools.ietf.org/html/rfc6749#appendix-A
   */
  VSCHAR: /^[\u0020-\u007E]+$/,

  ALPHANUM: /^[a-zA-Z0-9]+$/g,

  /**
   * code-verifier = 43*128unreserved
   * unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
   * ALPHA = %x41-5A / %x61-7A
   * DIGIT = %x30-39
   *
   * @see https://datatracker.ietf.org/doc/html/rfc7636#section-4.1
   */
  UNRESERVED43_128:
    /^[\u0041-\u005A|\u0061-\u007A|\u0030-\u0039|\u002D|\u002E|\u005F|\u007E]+$/,
};

const commonRegexMessage = "${path} contains invalid characters";

export const uchar = string().matches(
  rule.UNICODECHARNOCRLF,
  commonRegexMessage
);

export const vschar = string().matches(rule.VSCHAR, commonRegexMessage);

export const nqchar = string().matches(rule.NQCHAR, commonRegexMessage);

export const nqschar = string().matches(rule.NQSCHAR, commonRegexMessage);

export const alphanum = string().matches(rule.ALPHANUM, commonRegexMessage);

export const unreserved43_128 = string().matches(
  rule.UNRESERVED43_128,
  commonRegexMessage
);

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

export const vResponseType = mixed().required().oneOf(["code", "token"]);
export const vClientId = vschar.required();
export const vClientSecret = vschar.required();
export const vState = nqchar.required();
export const vScope = nqchar;
export const vRedirectUri = string().required().url();
export const vCodeChallenge = unreserved43_128.required();
export const vCodeChallengeHash = mixed().required().oneOf(["S256"]);
export const vCode = unreserved43_128.required();
