import { Response } from "express";
import { OAuth2Model } from "../model";
import { PKCEStateObject } from "../utils";
import {
  AuthorizationResponse,
  AuthorizationRequest,
  AuthorizationResponseError,
} from "./";

export class AuthorizationHandler {
  private model: OAuth2Model;
  constructor(opts: { model: OAuth2Model }) {
    this.model = opts.model;
  }

  async handler(request: AuthorizationRequest, res: Response): Promise<void> {
    if (!request.params.subdomain) {
      throw new AuthorizationResponseError(
        "access_denied",
        request.params.state
      );
    }

    await request.validate();

    const params = request.params;

    const site = await this.model.getSite(params.subdomain);
    if (!site) {
      throw new AuthorizationResponseError("access_denied", params.state);
    }

    const server = await this.model.getServer(site, params.serverAlias);
    if (!server) {
      throw new AuthorizationResponseError("access_denied", params.state);
    }

    const client = await this.model.getClient(site, server, params.client_id);
    if (!client) {
      throw new AuthorizationResponseError("access_denied", params.state);
    }

    if (
      !Array.isArray(client.redirect_uris) ||
      !client.redirect_uris.includes(params.redirect_uri)
    ) {
      throw new AuthorizationResponseError("invalid_request", params.state);
    }

    const pkceStateObject: PKCEStateObject = {
      state: params.state,
      challenge: params.code_challenge,
      hash: params.code_challenge_hash,
    };

    const authorizationCode = this.model.generateAuthorizaionCode(
      client,
      pkceStateObject
    );

    await this.model.saveState(pkceStateObject);

    const response = new AuthorizationResponse(authorizationCode, params.state);

    return res.redirect(
      response.status,
      response.getRedirectUrl(params.redirect_uri)
    );
  }
}
