import yup from "yup";
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
  ALPHANUM: /^\w+$/g,
};

/**
 * Validate if a value matches a unicode character excluding the carriage
 * return and linefeed characters.
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
export const uchar = yup.string().matches(rule.UNICODECHARNOCRLF, "");

/**
 * Validate if a value matches against the printable set of unicode characters.
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
export const vschar = yup.string().matches(rule.VSCHAR);

/**
 * Validate if a value matches a unicode character.
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
export const nchar = yup.string().matches(rule.NCHAR);

/**
 * Validate if a value matches a unicode character, including exclamation marks.
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
export const nqchar = yup.string().matches(rule.NQCHAR);

/**
 * Validate if a value matches a unicode character, including exclamation marks and spaces.
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
export const nqschar = yup.string().matches(rule.NQSCHAR);

export const alphanum = yup.string().matches(rule.ALPHANUM);

/**
 * Schemas
 *
 * @see https://github.com/jquense/yup
 */

export const submitProfileSchema = yup.object().shape({
  first_name: alphanum.required(),
  last_name: alphanum.required(),
  email: yup.string().email().required(),
});

// validate(submitProfileSchema, {});

export const validate = async <T>(
  schema: ObjectSchema<ObjectShape>,
  data: T
): Promise<T | Record<string, unknown> | null> => {
  const result = await schema.validate(data);

  return result;
};
