import { Response } from "express";
import { is } from "../../../internal";
import { GrantType } from "./grant-type";
import { TokenResponseError } from "../token/token-response-error";
import { AccessTokenResponseParams } from "../response";

export class PasswordGrant extends GrantType {
  async handle(res: Response): Promise<void> {
    /**
     * The resource owner provides the client with its username and
     * password.
     *
     * The client requests an access token from the authorization
     * server's token endpoint by including the credentials received
     * from the resource owner.  When making the request, the client
     * authenticates with the authorization server.
     *
     * The server validates that the client is authorized to use
     * the provided grant type.
     *
     * The authorization server authenticates the client and validates
     * the resource owner credentials, and if valid, issues an access
     * token.
     */
    const request = this.request;

    if (!(await is.uchar(request.body.username))) {
      throw new TokenResponseError(
        "invalid_request",
        "The resource owner parameter 'username' is invalid"
      );
    }

    if (!(await is.uchar(request.body.password))) {
      throw new TokenResponseError(
        "invalid_request",
        "The resource owner parameter 'password' is invalid"
      );
    }

    // * Not implemented yet!
    // * this.model.getUser(site, request.body.username, request.body.password)

    const auth = request.ensureClientCredentials();

    const client = await this.model.getClient(auth.user, { site: this.site });
    if (!client) {
      throw new TokenResponseError("invalid_client");
    }

    if (!client.grant_types.includes("password")) {
      throw new TokenResponseError(
        "unauthorized_client",
        `The client is not authorized to use the provided grant type. Accepted grant types: [${client.grant_types.join(
          ", "
        )}]`
      );
    }

    if (client.type === "confidential") {
      if (client.client_secret !== auth.password) {
        throw new TokenResponseError(
          "invalid_client",
          "The client secret provided for a confidential client is invalid"
        );
      }
    }

    const resBody: AccessTokenResponseParams = {
      type: "token",
      token_type: "bearer",
      access_token: this.model.generateAccessToken("base64"),
      expires_in: client.access_token_lifetime,
    };

    if (request.scopes.size !== 0) {
      if (request.scopes.has("refresh_token")) {
        resBody.refresh_token = this.model.generateRefreshToken();
        resBody.refresh_token_expires_in = client.refresh_token_lifetime;
      }
    }

    res.set("Cache-Control", "no-store");
    res.set("Pragma", "no-cache");

    res.status(201).json(resBody);

    return Promise.resolve();
  }
}
