import { OAuth2Model } from "../model";
import { PKCEState } from "../crypto/pkce";
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

  async handler(request: AuthorizationRequest): Promise<AuthorizationResponse> {
    await request.validate();

    const params = request.params;

    const site = await this.model.getSite(params.subdomain);
    if (!site) {
      throw new AuthorizationResponseError("access_denied", params.state);
    }

    const client = await this.model.getClient(params.client_id, { site });
    if (!client) {
      throw new AuthorizationResponseError("access_denied", params.state);
    }

    if (
      !Array.isArray(client.redirect_uris) ||
      !client.redirect_uris.includes(params.redirect_uri)
    ) {
      throw new AuthorizationResponseError("invalid_request", params.state);
    }

    /**
     * Using PKCE extension to the Authorization Code flow to prevent
     * several attacks and to be able to securely perform the OAuth exchange
     * from public clients
     *
     * @see https://tools.ietf.org/html/rfc7636
     *
     * The server keeps the client id 'client_id' in the state object
     * to verify later that the authorizationcode was issued
     */

    const pkceState: PKCEState = {
      verifier: params.state,
      challenge: params.code_challenge,
      challenge_method: params.code_challenge_hash,
      issued_to: client.client_id,
      redirect_uri: request.params.redirect_uri,
    };

    const pkceSecret = client.client_secret;

    const authorizationCode = this.model.generateAuthorizaionCode(
      pkceState,
      pkceSecret
    );

    await this.model.savePKCEState(pkceState);

    return new AuthorizationResponse(request, authorizationCode);
  }
}
