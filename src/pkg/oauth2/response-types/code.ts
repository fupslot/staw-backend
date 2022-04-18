import { format as fmt } from "util";
import { Response } from "express";

import { ResponseType } from "./response-type";
import { is } from "../../../internal";
import { PKCEState } from "../crypto/token";
import { HttpBadRequestError } from "../response-error";

export class CodeResponseType extends ResponseType {
  async handle(res: Response): Promise<void> {
    const request = this.request;

    if (!(await is.uri(request.query.redirect_uri))) {
      throw new HttpBadRequestError(
        "invalid_request",
        "redirect_uri_not_valid"
      );
    }

    if (
      !Array.isArray(this.client.redirect_uris) ||
      !this.client.redirect_uris.includes(request.query.redirect_uri)
    ) {
      throw new HttpBadRequestError(
        "invalid_request",
        "redirect_uri_not_allowed"
      );
    }

    if (!(await is.unreserved43_128(request.query.code_challenge))) {
      throw new HttpBadRequestError(
        "invalid_request",
        "code_challenge_not_valid"
      );
    }

    if (request.query.code_challenge_hash !== "S256") {
      throw new HttpBadRequestError(
        "invalid_request",
        "code_challenge_hash_not_valid"
      );
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
      verifier: request.query.state,
      challenge: request.query.code_challenge,
      challenge_method: request.query.code_challenge_hash,
      issued_to: this.client.client_id,
      redirect_uri: request.query.redirect_uri,
    };

    /**
     * If the client omits the scope parameter when requesting
     * authorization, the authorization server MUST process the
     * request using a pre-defined default value.
     *
     * If the client submits the scope parameter that requesting
     * authorization, the authorization server MUST validate
     * the requested scope values using a pre-defined scope list.
     */
    const acceptedScopes = this.model.valueOfScope(
      request.scopes,
      new Set(this.server.scopes)
    );
    if (!acceptedScopes) {
      throw new HttpBadRequestError(
        "invalid_scope",
        "One or more scopes are not configured for the authorization server"
      );
    }

    pkceState.scope = [...acceptedScopes].join(" ");

    const pkceSecret = this.client.client_secret;
    const code = this.model.generateAuthorizaionCode(pkceState, pkceSecret);

    await this.model.savePKCEState(pkceState);

    const redirectUri = fmt(
      "%s?code=%s&state=%s",
      request.query.redirect_uri,
      code,
      request.query.state
    );

    res.set("Location", redirectUri);
    res.set("Cache-Control", "no-store");
    res.set("Pragma", "no-cache");

    res.redirect(302, redirectUri);

    return Promise.resolve();
  }
}
