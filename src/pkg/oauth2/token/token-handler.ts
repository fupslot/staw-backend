import { Response } from "express";
import { TokenResponseError } from "./";

import { is } from "../../../internal";
import { RequestHandler } from "../request";
import { AuthorizationCodeGrant } from "../grant-types/authorization-code";
import { ClientCredentialGrant } from "../grant-types/client-credentials";

export class TokenHandler extends RequestHandler {
  async handle(res: Response): Promise<void> {
    const request = this.request;

    if (!(await is.unreserved36(request.params.serverAlias))) {
      throw new TokenResponseError("invalid_request");
    }

    if (!request.subdomain) {
      throw new TokenResponseError("invalid_client");
    }

    if (request.query.client_secret) {
      throw new TokenResponseError(
        "invalid_request",
        "Ensure to avoid sending 'client_secret' via the request uri"
      );
    }

    const site = await this.model.getSite(request.subdomain);
    if (!site) {
      throw new TokenResponseError("invalid_request");
    }

    const server = await this.model.getServer(request.params.serverAlias, site);
    if (!server) {
      throw new TokenResponseError("invalid_request");
    }

    const grantType = request.body.grant_type;

    if (grantType === "authorization_code") {
      return new AuthorizationCodeGrant({
        model: this.model,
        site,
        request,
      }).handle(res);
    }

    if (grantType === "client_credentials") {
      return new ClientCredentialGrant({
        model: this.model,
        site,
        request,
      }).handle(res);
    }

    if (grantType === "refresh_token") {
      throw new TokenResponseError("unsupported_grant_type");
    }

    throw new TokenResponseError("unsupported_grant_type");
  }
}
