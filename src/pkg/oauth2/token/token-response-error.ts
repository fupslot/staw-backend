import { format as fmt } from "util";
import { object } from "yup/lib/locale";

interface ErroResponse {
  error: ErrorMessageType;
  error_description?: string;
  error_uri?: string;
}

type ErrorMessageType =
  | "invalid_request"
  | "invalid_client"
  | "invalid_grant"
  | "unauthorized_client"
  | "unsupported_grant_type"
  | "invalid_scope";

export class TokenResponseError extends Error {
  error: ErrorMessageType;
  error_description?: string;
  error_uri?: string;
  status: number;

  /**
   * 
   * @param message - Error code
   * @param state - REQUIRED if a "state" parameter was present in the client authorization request
   * @param description - OPTIONAL. Human-readable ASCII [USASCII] text providing additional information, used to assist the client developer in understanding the error that occurred.

   * @param uri - OPTIONAL. A URI identifying a human-readable web page with information about the error, used to provide the client developer with additional information about the error.
   */
  constructor(message: ErrorMessageType, description?: string, uri?: string) {
    super();
    this.error = message;
    this.status = 400;

    if (description) {
      this.error_description = encodeURIComponent(description);
    }

    if (uri) {
      this.error_uri = encodeURIComponent(uri);
    }
  }

  valueOf(): ErroResponse {
    const obj: ErroResponse = {
      error: this.error,
    };

    if (this.error_description) {
      obj.error_description = this.error_description;
    }

    if (this.error_uri) {
      obj.error_uri = this.error_uri;
    }

    return obj;
  }
}
