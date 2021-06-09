import { format as fmt } from "util";
import { Router, Request } from "express";
import Boom from "@hapi/boom";
import { IAppContext } from "../../context";
import {
  wrap,
  pkce,
  printJSON,
  PKCECodeChallengeHash,
} from "../../../internal";
import { urlencoded } from "../../http";
import {
  response_type,
  client_id,
  state,
  scope,
  redirect_uri,
  code_challenge,
  code_challenge_hash,
} from "../../../internal/validation";

type ResponseType = "code" | "token";
interface RequestParams {
  authz: string;
}

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

type RequestParamsType = Readonly<Required<RequestParams>>;
type RequestQueryParamsType = Readonly<RequestQueryParams>;
type AuthorizeRequest = Request<
  RequestParamsType,
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
    wrap<AuthorizeRequest>(async (req, res) => {
      if (req.query.client_secret) {
        throw Boom.badRequest(
          "Invalid required: attribute 'client_secret' must not be sent"
        );
      }

      if (!(await response_type.isValid(req.query.response_type))) {
        throw Boom.badRequest(
          "Invalid required: attribute 'response_type' must be 'code' or 'token'"
        );
      }

      if (!(await client_id.isValid(req.query.client_id))) {
        throw Boom.badRequest(
          "Invalid required: attribute 'client_id' is required"
        );
      }

      if (!(await state.isValid(req.query.state))) {
        throw Boom.badRequest(
          "Invalid required: attribute 'state' is required"
        );
      }

      if (!(await scope.isValid(req.query.scope))) {
        throw Boom.badRequest("Invalid required: attribute 'scope' is invalid");
      }

      if (!(await redirect_uri.isValid(req.query.redirect_uri))) {
        throw Boom.badRequest(
          "Invalid required: attribute 'redirect_uri' is required"
        );
      }

      if (!(await code_challenge.isValid(req.query.code_challenge))) {
        throw Boom.badRequest(
          "Invalid required: attribute 'code_challenge' is required"
        );
      }

      // vCodeChallengeHash
      if (!(await code_challenge_hash.isValid(req.query.code_challenge_hash))) {
        throw Boom.badRequest(
          "Invalid required: attribute 'code_challenge_hash'=S256 is required"
        );
      }

      console.log(req.query);

      const pkceCode = {
        challenge: req.query.code_challenge,
        hash: req.query.code_challenge_hash,
      };

      // validationResult.response_type == "code";
      // 1. generate code
      const returnCode = pkce.returnCode(ctx.config.PKCE_PRIVATE_KEY, pkceCode);

      printJSON(returnCode);

      // Note: Move that to POST /token
      if (
        !pkce.returnCodeVerify(ctx.config.PKCE_PUBLIC_KEY, pkceCode, returnCode)
      ) {
        console.log("bad code");
      }

      // req.params.authorizationServer;

      // 2. validate query params

      const redirectUri = req.query.redirect_uri;
      // NOTE: `redirect_uri` must be verified with an application configuration setiings
      // if (redirect_uri !== client.redirect_uri) {
      // Validation failed
      // }

      const redirectTo = fmt(
        "%s?code=%s&state=%s",
        redirectUri,
        returnCode.value,
        req.query.state
      );

      res.redirect(302, redirectTo);
    })
  );

  return authorize;
}
