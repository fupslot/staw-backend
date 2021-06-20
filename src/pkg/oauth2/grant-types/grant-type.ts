import { Site, OAuth2Client } from "@prisma/client";
import { OAuth2Model } from "../model";

type GrantTypeOptions = {
  model: OAuth2Model;
  site: Site;
  client: OAuth2Client;
};

export abstract class GrantType {
  protected model: OAuth2Model;
  protected site: Site;
  protected client: OAuth2Client;

  constructor(opts: GrantTypeOptions) {
    this.model = opts.model;
    this.site = opts.site;
    this.client = opts.client;
  }
}
