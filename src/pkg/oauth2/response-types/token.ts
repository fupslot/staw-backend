import { Response } from "express";
import { format as fmt } from "util";
import { Site, OAuth2Client } from "@prisma/client";
import { OAuth2Model } from "../model";
import { OAuthRequest } from "../request";
import { is } from "../../../internal";
import { AuthorizationResponseError } from "../authorization";
import { formatBase64url } from "../crypto/token";

type TokenResponseTypeOptions = {
  model: OAuth2Model;
  site: Site;
  state: string;
  client: OAuth2Client;
};

export class TokenResponseType {
  private model: OAuth2Model;
  private client: OAuth2Client;
  private site: Site;

  constructor(opts: TokenResponseTypeOptions) {
    this.model = opts.model;
    this.client = opts.client;
    this.site = opts.site;
  }

  async handle(request: OAuthRequest, res: Response): Promise<void> {
    if (!(await is.uri(request.query.redirect_uri))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        request.query.state
      );
    }

    if (
      !Array.isArray(this.client.redirect_uris) ||
      !this.client.redirect_uris.includes(request.query.redirect_uri)
    ) {
      throw new AuthorizationResponseError(
        "invalid_request",
        request.query.state
      );
    }

    const accessToken = this.model.generateAccessToken("base64url");

    const uriFragment = true;
    const searchParams: [string, string][] = [];

    searchParams.push(["token_type", "bearer"]);
    searchParams.push(["access_token", accessToken]);
    searchParams.push(["expire_in", "" + this.client.access_token_lifetime]);
    searchParams.push(["state", request.query.state]);

    if (request.query.scope) {
      searchParams.push(["scope", encodeURIComponent(request.query.scope)]);
    }

    const redirectUri = fmt(
      "%s%s%s",
      request.query.redirect_uri,
      uriFragment ? "#" : "?",
      new URLSearchParams(searchParams).toString()
    );

    res.set("Cache-Control", "no-store");
    res.set("Pragma", "no-cache");
    res.set("Location", redirectUri);

    res.sendStatus(302);
    return Promise.resolve();
  }
}
