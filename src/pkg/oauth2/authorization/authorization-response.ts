import { format as fmt } from "util";
import { AuthorizationRequest } from "./authorization-request";
import { AbstractResponse } from "../abstract-response";
export class AuthorizationResponse extends AbstractResponse {
  request: AuthorizationRequest;
  authorizationCode: string;
  state: string;

  constructor(request: AuthorizationRequest, authorizationCode: string) {
    super();

    this.request = request;
    this.authorizationCode = authorizationCode;
    this.state = request.params.state;
    this.status = 302;

    this.set("Cache-Control", "no-store");
    this.set("Pragma", "no-cache");
  }

  getRedirectUrl(): string {
    return fmt(
      "%s?code=%s&state=%s",
      this.request.params.redirect_uri,
      this.authorizationCode,
      this.state
    );
  }
}
