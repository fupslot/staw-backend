import { Response } from "express";
import { OAuthRequest } from "../request";
import { Site, OAuth2Client } from "@prisma/client";
import { OAuth2Model } from "../model";

type ResponseTypeOptions = {
  request: OAuthRequest;
  model: OAuth2Model;
  site: Site;
  state: string;
  client: OAuth2Client;
};

export abstract class ResponseType {
  readonly request: OAuthRequest;
  readonly state: string;
  protected model: OAuth2Model;
  protected site: Site;
  protected client: OAuth2Client;

  constructor(opts: ResponseTypeOptions) {
    this.request = opts.request;
    this.model = opts.model;
    this.site = opts.site;
    this.client = opts.client;
    this.state = opts.state;
  }

  abstract handle(res: Response): Promise<void>;
}
