import { format as fmt } from "util";
import { Router, Request } from "express";
import Boom from "@hapi/boom";
import { IAppContext } from "../../context";
import {
  wrap,
  pkce,
  printJSON,
  PKCEStateObject,
  PKCECodeChallengeHash,
} from "../../../internal";
import { urlencoded, subdomain_required, OAuthParamsType } from "../../http";
import {
  vResponseType,
  vClientId,
  vState,
  vScope,
  vRedirectUri,
  vCodeChallenge,
  vCodeChallengeHash,
} from "../../../internal/validation";
import { AuthResponseError } from "./error-response";
import { AuthorizationResponse } from "./authorization-response";

type ResponseType = "code" | "token";

interface RequestQueryParams {
  /**
   * The value MUST be one of "code" for requesting an
   * authorization code, "token" for
   * requesting an access token (implicit grant)
   *
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.1
   */
  response_type: ResponseType;
  client_id: string;
  client_secret?: string;
  scope: string;
  state: string;
  redirect_uri: string;
  code_challenge: string;
  code_challenge_hash: PKCECodeChallengeHash;
}

type RequestQueryParamsType = Readonly<RequestQueryParams>;
type AuthorizeRequest = Request<
  OAuthParamsType,
  unknown,
  unknown,
  RequestQueryParamsType
>;

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
    subdomain_required(),
    wrap<AuthorizeRequest>(async (req, res) => {
      if (req.query.client_secret) {
        throw new AuthResponseError("invalid_request", req.query.state);
      }

      if (!(await vResponseType.isValid(req.query.response_type))) {
        throw new AuthResponseError("invalid_request", req.query.state);
      }

      if (!(await vClientId.isValid(req.query.client_id))) {
        throw new AuthResponseError("invalid_request", req.query.state);
      }

      if (!(await vState.isValid(req.query.state))) {
        throw new AuthResponseError("invalid_request", req.query.state);
      }

      if (!(await vScope.isValid(req.query.scope))) {
        throw new AuthResponseError("invalid_request", req.query.state);
      }

      if (!(await vRedirectUri.isValid(req.query.redirect_uri))) {
        throw new AuthResponseError("invalid_request", req.query.state);
      }

      if (!(await vCodeChallenge.isValid(req.query.code_challenge))) {
        throw new AuthResponseError("invalid_request", req.query.state);
      }

      if (!(await vCodeChallengeHash.isValid(req.query.code_challenge_hash))) {
        throw new AuthResponseError("invalid_request", req.query.state);
      }

      // Error Response
      // @see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1

      console.log(req.query);

      const pkceStateObject: PKCEStateObject = {
        state: req.query.state,
        challenge: req.query.code_challenge,
        hash: req.query.code_challenge_hash,
      };

      printJSON(pkceStateObject);

      // derive authorization code from pkce state object
      const authorizationCode = pkce.createAuthorizationCode(
        pkceStateObject,
        ctx.config.PKCE_AUTHORIZATION_CODE_SECRET
      );
      await ctx.cache.oauth.setState(pkceStateObject);

      printJSON({ authorizationCode });

      const redirectUri = req.query.redirect_uri;
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
