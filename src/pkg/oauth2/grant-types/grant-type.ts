import { Response } from "express";
import { OAuthRequest, AuthToken } from "../request";
import { Site } from "@prisma/client";
import { OAuth2Model } from "../model";

type GrantTypeOptions = {
  model: OAuth2Model;
  request: OAuthRequest;
  site: Site;
};

export abstract class GrantType {
  readonly auth: AuthToken;
  readonly request: OAuthRequest;
  protected model: OAuth2Model;
  protected site: Site;

  constructor(opts: GrantTypeOptions) {
    this.model = opts.model;
    this.site = opts.site;
    this.request = opts.request;
    this.auth = opts.request.ensureClientCredentials();
  }

  abstract handle(res: Response): Promise<void>;
}
