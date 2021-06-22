import { Response } from "express";
import { OAuthRequest } from "../request";
import { GrantType } from "./grant-type";
import { TokenResponseError } from "../token/token-response-error";
import { AccessTokenResponseParams } from "../response";

export class ClientCredentialGrant extends GrantType {
  async handle(request: OAuthRequest, res: Response): Promise<void> {
    /**
     * require client authentication for confidential clients or for any
     * client that was issued client credentials
     */
    const auth = request.ensureBasicCredentials();

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

    if (!client.grant_types.includes("client_credentials")) {
      throw new TokenResponseError(
        "unauthorized_client",
        `The client is not authorized to use the provided grant type. Accepted grant types: [${client.grant_types.join(
          ", "
        )}]`
      );
    }

    /**
     * Refresh token SHOULD NOT be included for the client credentials grant
     */
    const resBody: AccessTokenResponseParams = {
      type: "token",
      token_type: "bearer",
      access_token: this.model.generateAccessToken(),
      expires_in: client.access_token_lifetime,
    };

    res.set("Cache-Control", "no-store");
    res.set("Pragma", "no-cache");

    res.status(200).json(resBody);

    return Promise.resolve();
  }
}
