import { Site } from "@prisma/client";
import { OAuth2Model } from "../model";

type GrantTypeOptions = {
  model: OAuth2Model;
  site: Site;
};

export abstract class GrantType {
  protected model: OAuth2Model;
  protected site: Site;

  constructor(opts: GrantTypeOptions) {
    this.model = opts.model;
    this.site = opts.site;
  }
}
