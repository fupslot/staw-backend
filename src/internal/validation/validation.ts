import Boom from "@hapi/boom";
import { string } from "yup";
import ObjectSchema, { ObjectShape } from "yup/lib/object";

export class is {
  static message = "${path} contains invalid characters";
  /**
   * Validate if a value matches against the printable set of unicode characters.
   * VSCHAR     = %x20-7E
   *
   * @param value
   * @returns
   *
   * @see https://tools.ietf.org/html/rfc6749#appendix-A
   */
  static async vschar(value: string): Promise<boolean> {
    const VSCHAR = /^[\u0020-\u007E]+$/;

    return string().required().matches(VSCHAR, this.message).isValid(value);
  }

  /**
   * Validate if a value matches a unicode character, including exclamation marks.
   * NQCHAR     = %x21 / %x23-5B / %x5D-7E
   *
   * @param value
   * @returns
   *
   * @see https://tools.ietf.org/html/rfc6749#appendix-A
   */
  static async nqchar(value: string): Promise<boolean> {
    const NQCHAR = /^[\u0021|\u0023-\u005B|\u005D-\u007E]+$/;

    return string().required().matches(NQCHAR, this.message).isValid(value);
  }

  /**
   * Validate if a value matches a unicode character, including exclamation marks and spaces.
   * NQSCHAR    = %x20-21 / %x23-5B / %x5D-7E
   *
   * @param value
   * @returns
   *
   * @see https://tools.ietf.org/html/rfc6749#appendix-A
   */
  static async nqschar(value: string): Promise<boolean> {
    const NQSCHAR = /^[\u0020-\u0021|\u0023-\u005B|\u005D-\u007E]+$/;

    return string().required().matches(NQSCHAR, this.message).isValid(value);
  }

  /**
   * code-verifier = 43*128unreserved
   * unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
   * ALPHA = %x41-5A / %x61-7A
   * DIGIT = %x30-39
   *
   * @param value
   * @returns
   *
   * @see https://datatracker.ietf.org/doc/html/rfc7636#section-4.1
   */
  static async unreserved43_128(value: string): Promise<boolean> {
    const UNRESERVED43_128 =
      /^[\u0041-\u005A|\u0061-\u007A|\u0030-\u0039|\u002D|\u002E|\u005F|\u007E]+$/;

    return string()
      .required()
      .matches(UNRESERVED43_128, this.message)
      .isValid(value);
  }

  /**
   * Validate if a value matches a unicode character excluding the carriage
   * return and linefeed characters.
   * UNICODECHARNOCRLF = %x09 /%x20-7E / %x80-D7FF / %xE000-FFFD / %x10000-10FFFF
   *
   * @param value
   * @returns
   *
   * @see https://tools.ietf.org/html/rfc6749#appendix-A
   */
  static async uchar(value: string): Promise<boolean> {
    const UNICODECHARNOCRLF =
      // eslint-disable-next-line no-control-regex
      /^[\u0009|\u0020-\u007E|\u0080-\uD7FF|\uE000-\uFFFD|\u{10000}-\u{10FFFF}]+$/u;

    return string()
      .required()
      .matches(UNICODECHARNOCRLF, this.message)
      .isValid(value);
  }

  /**
   * Validate if a value matches against the printable set of unicode characters.
   * VSCHAR     = %x20-7E
   *
   * @param value
   * @returns
   *
   * @see https://tools.ietf.org/html/rfc6749#appendix-A
   */
  static async alphanum(value: string): Promise<boolean> {
    const ALPHANUM = /^[a-zA-Z0-9]+$/g;

    return string().required().matches(ALPHANUM, this.message).isValid(value);
  }

  static async uri(value: string): Promise<boolean> {
    return string().required().url().isValid(value);
  }

  /**
   * Unreserved characters in lowercase, digit and "-"
   * Matches a character in the range "a" to "z", "0" to "9" and "-" Case sensitive.
   * @param value
   * @returns
   */
  static unreserved36(value: string): Promise<boolean> {
    const chars = /^[\u0061-\u007A\u0030-\u0039\u002D]+$/;

    return string().required().matches(chars, this.message).isValid(value);
  }
}

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

// export const submitProfileSchema = object().shape({
//   first_name: alphanum.required(),
//   last_name: alphanum.required(),
//   email: string().email().required(),
// });

// export const PostSignUpSchema = object().shape({
//   siteId: string().required(),
//   email: string().email().required(),
// });

// export const InviteParamsSchema = object().shape({
//   code: alphanum,
// });
