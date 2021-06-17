import { OAuth2Model } from "./model";

export abstract class AbstructHandler {
  protected model: OAuth2Model;

  constructor(opts: { model: OAuth2Model }) {
    this.model = opts.model;
  }
}
