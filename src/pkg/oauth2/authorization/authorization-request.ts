import { Request } from "express";
import { IncomingHttpHeaders } from "http";
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
import { FallbackURI } from "./authorization-response";
import { AuthorizationResponseError } from "./authorization-response-error";

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

export type AuthorizeQueryParamsType = Readonly<RequestQueryParams>;
export type AuthorizationRequestType = Request<
  OAuthParamsType,
  unknown,
  unknown,
  AuthorizeQueryParamsType
>;

export type AuthorizeRequest = AuthorizeQueryParamsType &
  Required<OptionalRequestParams>;

export class AuthorizationRequest {
  fallbackURI: FallbackURI;
  params: OAuthParamsType &
    AuthorizeQueryParamsType & {
      subdomain: string;
    };
  headers: IncomingHttpHeaders;

  constructor(req: AuthorizationRequestType, fallbackURI: FallbackURI) {
    this.fallbackURI = fallbackURI;
    this.params = { ...req.params, ...req.query, subdomain: req.subdomain };
    this.headers = req.headers;
  }

  async validate(): Promise<void> {
    if (this.params.client_secret) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vResponseType.isValid(this.params.response_type))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vClientId.isValid(this.params.client_id))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vState.isValid(this.params.state))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vScope.isValid(this.params.scope))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vRedirectUri.isValid(this.params.redirect_uri))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vCodeChallenge.isValid(this.params.code_challenge))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vCodeChallengeHash.isValid(this.params.code_challenge_hash))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }
  }
}
