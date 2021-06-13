import { format as fmt } from "util";

export interface FallbackURI {
  SIGN_IN: string;
  SITE_BASE: string;
}

export class AuthorizationResponse {
  code: string;
  state: string;
  status: number;
  constructor(code: string, state: string) {
    this.code = code;
    this.state = state;
    this.status = 302;
  }

  getRedirectUrl(callbackURI: string): string {
    return fmt("%s?code=%s&state=%s", callbackURI, this.code, this.state);
  }
}
