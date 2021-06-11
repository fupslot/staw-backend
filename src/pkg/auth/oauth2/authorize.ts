import { Router } from "express";
import { IAppContext } from "../../context";
import { wrap, pkce, printJSON, PKCEStateObject } from "../../../internal";
import { urlencoded } from "../../http";
import { AuthorizationResponse } from "./authorization-response";
import { AuthorizationRequest, Authorize } from "./authorization-request";

export function createAuthoriseRoute(ctx: IAppContext): Router {
  const authorize = Router();

  /**
   * The authorization endpoint is used to interact with the resource
   * owner and obtain an authorization grant.  The authorization server
   * MUST first verify the identity of the resource owner.  The way in
   * which the authorization server authenticates the resource owner
   * (e.g., username and password login, session cookies) is beyond the
   * scope of this specification.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-3.1
   */
  authorize.get(
    "/v1/authorize",
    urlencoded(),
    wrap<Authorize>(async (req, res) => {
      const authRequest = await AuthorizationRequest(req);

      // [ ] - const client = await model.getClient(authRequest.client_id, authRequest.client_secret)
      // [ ] - model.createAuthorizationCode()

      console.log(authRequest);

      const pkceStateObject: PKCEStateObject = {
        state: authRequest.state,
        challenge: authRequest.code_challenge,
        hash: authRequest.code_challenge_hash,
      };

      printJSON(pkceStateObject);

      // derive authorization code from pkce state object
      const authorizationCode = pkce.createAuthorizationCode(
        pkceStateObject,
        ctx.config.PKCE_AUTHORIZATION_CODE_SECRET
      );
      await ctx.cache.oauth.setState(pkceStateObject);

      printJSON({ authorizationCode });

      // authRequest.redirect_uri;
      // NOTE: `redirect_uri` must be verified with an application configuration setiings
      // if (redirect_uri !== client.redirect_uri) {
      // Validation failed
      // }

      // todo: must be cool if error handler for oauth would be different from the rest of application

      const response = new AuthorizationResponse(
        authorizationCode,
        req.query.state
      );

      res.redirect(
        response.status,
        response.getRedirectUrl(req.query.redirect_uri)
      );
    })
  );

  return authorize;
}
