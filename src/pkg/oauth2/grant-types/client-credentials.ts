import { Response } from "express";
import { OAuthRequest } from "../request";
import { GrantType } from "./grant-type";
import { TokenResponseError } from "../token/token-response-error";

export class ClientCredentialGrant extends GrantType {
  async handle(request: OAuthRequest, res: Response): Promise<void> {
    /**
     * require client authentication for confidential clients or for any
     * client that was issued client credentials
     */
    const auth = request.authorization;

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

    return;
  }
}
