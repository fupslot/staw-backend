import { Request } from "express";
import { format as fmt } from "util";
import { IncomingHttpHeaders } from "http";
import { PKCECodeChallengeMethod } from "../oauth2/crypto/pkce";

interface FallbackURI {
  baseUrl: string;
  signInUrl: string;
}

type ResponseType = "code" | "token";

type AuthTokenTypes = "basic" | "bearer";
type AuthToken = {
  type: AuthTokenTypes;
  raw64?: string;
  raw: string;
  user?: string;
  password?: string;
};

export type RequestParamsType = {
  serverAlias: string;
  subdomain: string;
};

export type GrantType =
  | "authorization_code"
  | "client_credentials"
  | "password";

export interface AuthorizationQueryParams {
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
  code_challenge_hash: PKCECodeChallengeMethod;
}

export interface TokenRequestBody {
  grant_type: GrantType;
  code_verifier: string;
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}

export abstract class AbstractRequest<RequestType extends Request> {
  public subdomain: string | undefined;
  public headers: IncomingHttpHeaders;
  public fallback: FallbackURI;
  public authorization: AuthToken | null;

  constructor(request: RequestType) {
    const subdomain = request.subdomains.shift() || undefined;

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

      return token;
    } else if (authorization.startsWith("Bearer")) {
      return {
        type: "bearer",
        raw: authorization.substr("Bearer".length + 1),
      };
    }

    return null;
  }
}
