import { Response } from "express";
import { OAuthRequest } from "../request";
import { OAuthResponse, AccessTokenResponseParams } from "../response";
import { GrantType } from "./grant-type";
import { TokenResponseError } from "../token";
import { is } from "../../../internal";

export class AuthorizationCodeGrant extends GrantType {
  async handle(request: OAuthRequest, res: Response): Promise<void> {
    const clientId = request.body.client_id;

    if (!(await is.vschar(clientId))) {
      throw new TokenResponseError("invalid_client");
    }

    const client = await this.model.getClient(clientId, { site: this.site });
    if (!client) {
      throw new TokenResponseError("invalid_client");
    }

    if (!client.grant_types.includes("authorization_code")) {
      throw new TokenResponseError(
        "unauthorized_client",
        `The client is not authorized to use the provided grant type. Accepted grant types: [${client.grant_types.join(
          ", "
        )}]`
      );
    }

    if (!(await is.vschar(request.body.code))) {
      throw new TokenResponseError(
        "invalid_request",
        "The authorization code recived from the authorization server is required"
      );
    }

    const auth = request.ensureBasicCredentials();

    /**
     * Ensure client authentication for confidential clients
     * Authenticate the client if client authentication is included
     */
    if (client.type === "confidential") {
      if (client.client_secret !== auth.password) {
        throw new TokenResponseError("unauthorized_client");
      }
    }

    /**
     * Ensure that authorization code was issued to the authenticated
     * confidential client, or if the client is public, ensure that the code
     * was issued to 'client_id' in the request
     *
     * Verify that the authorization code is valid, and
     *
     * Ensure that the "redirect_uri" parameter is present if the
     * "redirect_uri" parameter was included in the initial authorization
     * request, and if included ensure that their values are identical.
     */

    const pkceState = await this.model.findPKCEState(
      request.body.code_verifier
    );

    if (!pkceState || pkceState.issued_to !== client.client_id) {
      throw new TokenResponseError("invalid_request");
    }

    const authorizationCode = this.model.generateAuthorizaionCode(
      pkceState,
      client.client_secret
    );

    if (request.body.code !== authorizationCode) {
      throw new TokenResponseError("invalid_request");
    }

    if (
      pkceState.redirect_uri &&
      pkceState.redirect_uri !== request.body.redirect_uri
    ) {
      throw new TokenResponseError(
        "invalid_request",
        "The initial authroization request included 'redirect_uri', ensure their values are identical"
      );
    }

    /**
     * Typically a service will either generate random strings and store them
     * in a database along with the associated user and scope information,
     * or will use "Self-Encoded" tokens where the token string itself contains
     * all the necessary info.
     *
     * @see https://www.oauth.com/oauth2-servers/access-tokens/self-encoded-access-tokens/
     */
    const tokenResponseParams: AccessTokenResponseParams = {
      type: "token",
      token_type: "bearer",
      access_token: this.model.generateAccessToken(),
      expires_in: client.access_token_lifetime,
    };

    /**
     * If the initial authorization request required the 'refresh_token' scope,
     * ensure to return the refresh token in the access token response
     */
    if (typeof pkceState.scope === "string") {
      const initialScopes = new Set(pkceState.scope.split(/\u0020/g));

      if (initialScopes.has("refresh_token")) {
        tokenResponseParams.refresh_token = this.model.generateRefreshToken();
        tokenResponseParams.refresh_token_expires_in =
          client.refresh_token_lifetime;
      }

      tokenResponseParams.scope = [...initialScopes].join(" ");
    }

    const response = new OAuthResponse(request, tokenResponseParams);
    res.set(response.headers);
    res.json(response.body);

    return Promise.resolve();
  }
}
