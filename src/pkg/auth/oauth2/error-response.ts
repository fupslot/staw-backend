import { format as fmt } from "util";
type ErrorMessageType =
  | "invalid_request"
  | "unauthorized_client"
  | "access_denied"
  | "unsupported_response_type"
  | "invalid_scope"
  | "server_error"
  | "temporarily_unavailable";

export class AuthResponseError extends Error {
  error: ErrorMessageType;
  error_description?: string;
  error_uri?: string;
  state?: string;
  status: number;

  /**
   * 
   * @param message - Error code
   * @param state - REQUIRED if a "state" parameter was present in the client authorization request
   * @param description - OPTIONAL. Human-readable ASCII [USASCII] text providing additional information, used to assist the client developer in understanding the error that occurred.

   * @param uri - OPTIONAL. A URI identifying a human-readable web page with information about the error, used to provide the client developer with additional information about the error.
   */
  constructor(
    message: ErrorMessageType,
    state?: string,
    description?: string,
    uri?: string
  ) {
    super();
    this.error = message;
    this.status = 302;

    if (description) {
      this.error_description = encodeURIComponent(description);
    }

    if (uri) {
      this.error_uri = encodeURIComponent(uri);
    }

    this.state = state;
  }

  getRedirectUri(callback_uri: string): string {
    const bits: [string, string][] = [];

    bits.push(["error", this.error]);

    if (this.state) {
      bits.push(["state", this.state]);
    }

    if (this.error_uri) {
      bits.push(["error_uri", this.error_uri]);
    }

    if (this.error_description) {
      bits.push(["error_description", this.error_description]);
    }

    const params = new URLSearchParams(bits);

    return fmt("%s?%s", callback_uri, params.toString());
  }
}
