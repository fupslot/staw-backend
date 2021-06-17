import { TokenRequest } from "./token-request";
import { AbstractResponse } from "../abstract-response";
/**
 * "access_token":"2YotnFZFEjr1zCsicMWpAA",
 * "token_type":"example",
 * "expires_in":3600,
 * "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
 * "example_parameter":"example_value"
 */

// type TokenType = "string";
// type ResponseBody = {
//   access_token: string;
//   token_type: TokenType;
//   expires_in: number;
//   refresh_token?: string;
// };

export class TokenResponse extends AbstractResponse {
  request: TokenRequest;

  // body: Record<string, string | number>;

  constructor(request: TokenRequest) {
    super();

    this.request = request;
    this.status = 201;

    this.set("Cache-Control", "no-store");
    this.set("Pragma", "no-cache");
    this.set("Content-Type", "application/json");
  }

  valueOf(): Record<string, unknown> {
    return {};
  }
}
