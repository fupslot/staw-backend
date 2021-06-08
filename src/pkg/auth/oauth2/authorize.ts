// import { format as fmt } from 'util'
import { Router, Request } from "express";
import Boom from "@hapi/boom";
import { IAppContext } from "../../context";
import { wrap } from "../../../internal/util";
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
type CodeChallengeHash = "S256";
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
  code_challenge_hash: CodeChallengeHash;
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

      if (!response_type.isValid(req.query.response_type)) {
        throw Boom.badRequest(
          "Invalid required: attribute 'response_type' must be 'code' or 'token'"
        );
      }

      if (!client_id.isValid(req.query.client_id)) {
        throw Boom.badRequest(
          "Invalid required: attribute 'client_id' is required"
        );
      }

      if (!state.isValid(req.query.state)) {
        throw Boom.badRequest(
          "Invalid required: attribute 'state' is required"
        );
      }

      if (!scope.isValid(req.query.scope)) {
        throw Boom.badRequest("Invalid required: attribute 'scope' is invalid");
      }

      if (!redirect_uri.isValid(req.query.redirect_uri)) {
        throw Boom.badRequest(
          "Invalid required: attribute 'redirect_uri' is required"
        );
      }

      if (!code_challenge.isValid(req.query.code_challenge)) {
        throw Boom.badRequest(
          "Invalid required: attribute 'code_challenge' is required"
        );
      }

      if (!code_challenge_hash.isValid(req.query.code_challenge_hash)) {
        throw Boom.badRequest(
          "Invalid required: attribute 'code_challenge_hash' is required"
        );
      }

      console.log(req.query);

      // validationResult.response_type == "code";
      // 1. validate authorization server name (ALPHA)
      // req.params.authorizationServer;

      // 2. validate query params

      res.sendStatus(200);
    })
  );

  return authorize;
}
