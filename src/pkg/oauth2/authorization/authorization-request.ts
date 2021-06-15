import { format as fmt } from "util";
import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { PKCECodeChallengeHash } from "../../../internal";
import {
  vClientId,
  vState,
  vScope,
  vRedirectUri,
  vCodeChallenge,
  vCodeChallengeHash,
} from "../../../internal/validation";
import { AuthorizationResponseError } from "./authorization-response-error";

type ResponseType = "code" | "token";

export interface OptionalRequestParams {
  serverAlias?: string;
}

export type OAuthParamsType = Readonly<
  Required<Pick<OptionalRequestParams, "serverAlias">>
>;

interface RequestQueryParams {
  [key: string]: string | ResponseType | undefined;
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

type AuthorizationRequestParams = OAuthParamsType &
  RequestQueryParams & {
    subdomain: string;
  };

interface FallbackURI {
  baseUrl: string;
  signInUrl: string;
}

export type AuthorizationRequestType = Request<
  OAuthParamsType,
  unknown,
  unknown,
  RequestQueryParams
>;

export type AuthorizeRequest = RequestQueryParams &
  Required<OptionalRequestParams>;

type AuthTokenTypes = "basic" | "bearer";
type AuthToken = {
  type: AuthTokenTypes;
  raw64?: string;
  raw: string;
  user?: string;
  password?: string;
};

abstract class AbstractRequest<RequestType extends Request> {
  public subdomain: string;
  public headers: IncomingHttpHeaders;
  public fallback: FallbackURI;
  public authorization: AuthToken | null;

  constructor(request: RequestType) {
    const subdomain = request.subdomains.shift() || undefined;
    if (!subdomain) {
      throw new AuthorizationResponseError("access_denied");
    }

    this.subdomain = subdomain;
    this.headers = request.headers;
    this.authorization = this.getAuthorization(request.get("authorization"));
    this.fallback = this.getFallbackUrls(request);
  }

  getFallbackUrls(request: RequestType): FallbackURI {
    const host = request.get("host") || "";
    const protocol = request.protocol;

    return {
      baseUrl: fmt("%s://%s", protocol, host),
      signInUrl: fmt("%s://%s/sign-in", protocol, host),
    };
  }

  getAuthorization(authorization: string | undefined): AuthToken | null {
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

export class AuthorizationRequest extends AbstractRequest<AuthorizationRequestType> {
  public params: AuthorizationRequestParams;

  constructor(req: AuthorizationRequestType) {
    super(req);

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

    if (
      this.params.response_type !== "code" &&
      this.params.response_type !== "token"
    ) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state,
        `The response type 'response_type' must be registered with one of the values 'code' or 'token' but found only '${this.params.response_type}' instead`
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
