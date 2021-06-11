import { Request } from "express";
import { PKCECodeChallengeHash } from "../../../internal";
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

type ResponseType = "code" | "token";

export interface OptionalRequestParams {
  serverAlias?: string;
}

export type OAuthParamsType = Readonly<
  Required<Pick<OptionalRequestParams, "serverAlias">>
>;

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

type AuthorizeQueryParamsType = Readonly<RequestQueryParams>;
export type Authorize = Request<
  OAuthParamsType,
  unknown,
  unknown,
  AuthorizeQueryParamsType
>;

type AuthorizeRequest = AuthorizeQueryParamsType &
  Required<OptionalRequestParams>;

export async function AuthorizationRequest(
  req: Authorize
): Promise<AuthorizeRequest> {
  const params = req.query;

  if (!("site" in req)) {
    throw new AuthResponseError("access_denied", params.state);
  }

  if (params.client_secret) {
    throw new AuthResponseError("invalid_request", params.state);
  }

  if (!(await vResponseType.isValid(params.response_type))) {
    throw new AuthResponseError("invalid_request", params.state);
  }

  if (!(await vClientId.isValid(params.client_id))) {
    throw new AuthResponseError("invalid_request", params.state);
  }

  if (!(await vState.isValid(params.state))) {
    throw new AuthResponseError("invalid_request", params.state);
  }

  if (!(await vScope.isValid(params.scope))) {
    throw new AuthResponseError("invalid_request", params.state);
  }

  if (!(await vRedirectUri.isValid(params.redirect_uri))) {
    throw new AuthResponseError("invalid_request", params.state);
  }

  if (!(await vCodeChallenge.isValid(params.code_challenge))) {
    throw new AuthResponseError("invalid_request", params.state);
  }

  if (!(await vCodeChallengeHash.isValid(params.code_challenge_hash))) {
    throw new AuthResponseError("invalid_request", params.state);
  }

  return { ...req.query, serverAlias: req.params.serverAlias };
}
