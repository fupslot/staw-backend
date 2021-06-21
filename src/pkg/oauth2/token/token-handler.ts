import { Response } from "express";
import { TokenResponseError } from "./";
import { IOAuth2Model } from "../model";

// import { is } from "../../../internal";
import { OAuthRequest } from "../request";
import { AuthorizationCodeGrant } from "../grant-types/authorization-code";
import { ClientCredentialGrant } from "../grant-types/client-credentials";

export class TokenHandler extends IOAuth2Model {
  async handle(request: OAuthRequest, res: Response): Promise<void> {
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

    const grantType = request.body.grant_type;

    if (grantType === "authorization_code") {
      return new AuthorizationCodeGrant({
        model: this.model,
        site,
      }).handle(request, res);
    } else if (grantType === "client_credentials") {
      return new ClientCredentialGrant({
        model: this.model,
        site,
      }).handle(request, res);
    } else if (grantType === "password") {
      throw new TokenResponseError("unsupported_grant_type");
    } else if (grantType === "refresh_token") {
      throw new TokenResponseError("unsupported_grant_type");
    } else {
      throw new TokenResponseError("unsupported_grant_type");
    }
  }
}
