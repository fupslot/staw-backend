import { Response } from "express";
import { OAuth2Model } from "../model";
import { OAuthRequest } from "../request";
import { AccessTokenResponseParams, OAuthResponse } from "../response";

export class TokenResponseType implements AccessTokenResponseParams {
  private model: OAuth2Model;
  type: "token";
  token_type: "bearer";
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;

  constructor(opts: { model: OAuth2Model }) {
    this.model = opts.model;
    this.type = "token";
    this.token_type = "bearer";
    this.access_token = "";
    this.expires_in = -1;
  }

  async handle(request: OAuthRequest, res: Response): Promise<void> {
    // implementation
    const response = new OAuthResponse(request, this);

    res.set(response.headers);
    res.statusCode = response.status;
    res.send();
  }
}
