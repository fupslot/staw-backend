import { Response } from "express";
import { OAuthRequest } from "../request";
import { OAuthResponse, AccessTokenResponseParams } from "../response";
import { GrantType } from "./grant-type";
import { TokenResponseError } from "../token";
import { is } from "../../../internal";

export class AuthorizationCode extends GrantType {
  async handle(request: OAuthRequest, res: Response): Promise<void> {
    if (!(await is.vschar(request.body.code))) {
      throw new TokenResponseError(
        "invalid_request",
        "The authorization code recived from the authorization server is required"
      );
    }

    /**
     * require client authentication for confidential clients or for any
     * client that was issued client credentials
     */
    if (
      !request.authorization ||
      request.authorization.type !== "basic" ||
      !request.authorization.user ||
      !request.authorization.password
    ) {
      const responseError = new TokenResponseError("invalid_client");
      responseError.set(
        "WWW-Authenticate",
        'Basic realm="Client" charset="UTF-8"'
      );
      responseError.status = 401;
      throw responseError;
    }

    /**
     * Ensure client authentication for confidential clients
     * Authenticate the client if client authentication is included
     */
    if (this.client.type == "confidential") {
      const auth = request.authorization;

      if (!auth || !auth.user || !auth.password) {
        throw new TokenResponseError("unauthorized_client");
      }

      if (this.client.client_secret !== auth.password) {
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

    if (!pkceState || pkceState.issued_to !== this.client.client_id) {
      throw new TokenResponseError("invalid_request");
    }

    const authorizationCode = this.model.generateAuthorizaionCode(
      pkceState,
      this.client.client_secret
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
      expires_in: this.client.access_token_lifetime,
      // ? scope: pkceState.scope
    };

    /**
     * If the initial authroization request required the 'refresh_token' scope,
     * ensure to return the refresh token in the response
     * * todo: pkceState.scope.has('refresh_token')
     *   refresh_token: '',
     *   refresh_token_expires_in: 60,
     */
    // this.client.access_token_lifetime;
    // this.client.refresh_token_lifetime;

    const response = new OAuthResponse(request, tokenResponseParams);
    res.set(response.headers);
    res.json(response.body);

    return Promise.resolve();
  }
}
