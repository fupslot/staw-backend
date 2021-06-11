import { format as fmt } from "util";
export class AuthorizationResponse {
  code: string;
  state: string;
  status: number;
  constructor(code: string, state: string) {
    this.code = code;
    this.state = state;
    this.status = 302;
  }

  getRedirectUrl(callback_uri: string): string {
    return fmt("%s?code=%s&state=%s", callback_uri, this.code, this.state);
  }
}
