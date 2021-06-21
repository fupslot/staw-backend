import { Response } from "express";
import { OAuthRequest } from "../request";
import { GrantType } from "./grant-type";
import { TokenResponseError } from "../token/token-response-error";
import { AccessTokenResponseParams, OAuthResponse } from "../response";

export class ClientCredentialGrant extends GrantType {
  async handle(request: OAuthRequest, res: Response): Promise<void> {
    /**
     * require client authentication for confidential clients or for any
     * client that was issued client credentials
     */
    const auth = request.authorization;

    /**
     * * REFACTOR: There are few places where the authorization credentials are
     * *           required. Thinking about moving this part to be member of GrantType class
     * * const auth = this.ensureAuthorizationCredentials(request); AuthToken | throw
     */
    if (!auth || auth.type !== "basic" || !auth.user || !auth.password) {
      const responseError = new TokenResponseError("invalid_client");
      responseError.set(
        "WWW-Authenticate",
        'Basic realm="Client" charset="UTF-8"'
      );
      responseError.status = 401;
      throw responseError;
    }

    const client = await this.model.getClient(auth.user, { site: this.site });
    if (!client) {
      throw new TokenResponseError("invalid_client");
    }

    if (client.type !== "confidential") {
      throw new TokenResponseError(
        "invalid_request",
        "The client credentials grant type must only be used by confidential clients"
      );
    }

    if (client.client_secret !== auth.password) {
      throw new TokenResponseError("unauthorized_client");
    }

    /**
     * Refresh token SHOULD NOT be included for the client credentials grant
     */

    const tokenResponseParams: AccessTokenResponseParams = {
      type: "token",
      token_type: "bearer",
      access_token: this.model.generateAccessToken(),
      expires_in: client.access_token_lifetime,
    };

    const response = new OAuthResponse(request, tokenResponseParams);
    res.set(response.headers);
    res.json(response.body);

    return Promise.resolve();
  }
}
