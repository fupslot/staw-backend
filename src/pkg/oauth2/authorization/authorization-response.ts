import { OutgoingHttpHeaders, OutgoingHttpHeader } from "http";
import { format as fmt } from "util";
import { AuthorizationRequest } from "./authorization-request";
import { lowercase } from "../../../internal";
abstract class AbstractResponse {
  headers: OutgoingHttpHeaders;
  status: number;

  constructor() {
    this.status = 200;
    this.headers = {};
  }

  set(key: string, value: OutgoingHttpHeader): void {
    this.headers[lowercase(key)] = value;
  }

  get(key: string): OutgoingHttpHeader | undefined {
    return this.headers[lowercase(key)];
  }
}

export class AuthorizationResponse extends AbstractResponse {
  request: AuthorizationRequest;
  code: string;
  state: string;

  constructor(request: AuthorizationRequest, code: string) {
    super();

    this.request = request;
    this.code = code;
    this.state = request.params.state;
    this.status = 302;

    this.set("Cache-Control", "no-store");
    this.set("Pragma", "no-cache");
  }

  getRedirectUrl(): string {
    return fmt(
      "%s?code=%s&state=%s",
      this.request.params.redirect_uri,
      this.code,
      this.state
    );
  }
}
