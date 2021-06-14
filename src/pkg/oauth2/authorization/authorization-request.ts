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

export type AuthorizeQueryParamsType = RequestQueryParams;
export type AuthorizationRequestType = Request<
  OAuthParamsType,
  unknown,
  unknown,
  AuthorizeQueryParamsType
>;

export type AuthorizeRequest = AuthorizeQueryParamsType &
  Required<OptionalRequestParams>;

type AuthTokenTypes = "basic" | "bearer";
type AuthToken = {
  type: AuthTokenTypes;
  raw64?: string;
  raw: string;
  user?: string;
  password?: string;
};

export class AuthorizationRequest {
  public fallbackURI: FallbackURI;
  public params: OAuthParamsType &
    AuthorizeQueryParamsType & {
      subdomain: string;
    };
  public headers: IncomingHttpHeaders;
  public authorization: AuthToken | null;

  constructor(req: AuthorizationRequestType, fallbackURI: FallbackURI) {
    this.fallbackURI = fallbackURI;
    this.headers = req.headers;
    this.authorization = this.getTokenFromHeader(req.headers["authorization"]);
    this.params = { ...req.params, ...req.query, subdomain: req.subdomain };

    if (this.authorization?.type === "basic") {
      if (this.authorization.user && this.authorization.password) {
        this.params.client_id = this.authorization.user;
        this.params.client_secret = this.authorization.password;
      }
    }

    if (this.authorization?.type === "bearer") {
      // todo: parse jwt
    }

    if (this.params.scope) {
      //
    }
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

  private getTokenFromHeader(
    authorization: string | undefined
  ): AuthToken | null {
    if (!authorization) {
      return null;
    }

    if (authorization.startsWith("Basic")) {
      const token: AuthToken = {
        type: "basic",
        raw64: authorization.substr("Basic".length + 1),
        raw: Buffer.from(
          authorization.substr("Basic".length + 1),
          "base64"
        ).toString(),
      };

      const [user, password] = token.raw.split(":");

      if (user && password) {
        token.user = user;
        token.password = password;
      }
    } else if (authorization.startsWith("Bearer")) {
      return {
        type: "bearer",
        raw: authorization.substr("Bearer".length + 1),
      };
    }

    return null;
  }
}
