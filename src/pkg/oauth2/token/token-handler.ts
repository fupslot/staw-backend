import { TokenRequest, TokenResponseError } from "./";
import { AbstructHandler } from "../abstract-handler";
import { TokenResponse } from "./token-response";

export class TokenHandler extends AbstructHandler {
  async handler(request: TokenRequest): Promise<TokenResponse> {
    await request.validate();

    /**
     * Client authentication failed (e.g., unknown client, no client authentication
     * included, or unsupported authentication method)
     *
     * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
     */
    if (
      !request.authorization ||
      request.authorization.type !== "basic" ||
      !request.authorization.user ||
      !request.authorization.password
    ) {
      const error = new TokenResponseError("invalid_client");

      error.set("WWW-Authenticate", 'Basic realm="Client" charset="UTF-8"');
      error.status = 401;

      throw error;
    }

    const params = request.params;

    const site = await this.model.getSite(params.subdomain);
    if (!site) {
      throw new TokenResponseError("invalid_request");
    }

    const client = await this.model.getClient(request.authorization.user, {
      site,
    });
    if (!client) {
      throw new TokenResponseError("invalid_request");
    }

    if (request.authorization.password !== client.client_secret) {
      throw new TokenResponseError("invalid_request");
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
     * request, and if included ensure that
     * their values are identical.
     */
    const pkceState = await this.model.findPKCEState(
      request.params.code_verifier
    );

    if (!pkceState) {
      throw new TokenResponseError("invalid_request");
    }

    if (pkceState.issued_to !== client.client_id) {
      throw new TokenResponseError("invalid_request");
    }

    const authorizationCode = this.model.generateAuthorizaionCode(
      pkceState,
      client.client_secret
    );

    if (request.params.code !== authorizationCode) {
      throw new TokenResponseError("invalid_request");
    }

    if (
      pkceState.redirect_uri &&
      pkceState.redirect_uri !== request.params.redirect_uri
    ) {
      throw new TokenResponseError("invalid_request");
    }

    /**
     * The authroization server issue an access token and optionally
     * the refresh token.
     */

    return new TokenResponse(request);
  }
}
