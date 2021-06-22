import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { format as fmt } from "util";

import { PKCECodeChallengeMethod } from "./crypto/token";
import { TokenResponseError } from "./token";

export type GrantType =
  | "authorization_code"
  | "client_credentials"
  | "password"
  | "refresh_token";

type ResponseType = "code" | "token";

type RequestParamsType = {
  serverAlias: string;
};

type RequestBodyType = {
  grant_type: GrantType;

  code_verifier: string;

  code: string;

  redirect_uri: string;

  client_id: string;

  client_secret: string;

  /**
   * The resource owner username.
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-4.3.2
   */
  username: string;

  /**
   * The resource owner password.
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-4.3.2
   */
  password: string;

  scope?: string;
};

type RequestQueryType = {
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

  scope?: string;

  state: string;

  redirect_uri: string;

  code_challenge: string;

  code_challenge_hash: PKCECodeChallengeMethod;
};

export type OAuthRequestType = Request<
  RequestParamsType,
  unknown,
  RequestBodyType,
  RequestQueryType
>;

interface FallbackURI {
  baseUrl: string;
  signInUrl: string;
}

type AuthTokenTypes = "basic" | "bearer";
type AuthToken = {
  type: AuthTokenTypes;
  value: string;
  user?: string;
  password?: string;
};

/**
 * OAuthRequest
 *
 * Class for handling 'authorize' and 'token' requests
 */
export class OAuthRequest {
  public subdomain: string | null;
  public headers: IncomingHttpHeaders;
  public fallback: FallbackURI;
  public authorization: AuthToken | null;
  public query: RequestQueryType;
  public params: RequestParamsType;
  public body: RequestBodyType;
  public scopes: Set<string>;

  constructor(request: OAuthRequestType) {
    this.headers = request.headers;
    this.query = request.query;
    this.params = request.params;
    this.body = request.body;

    this.scopes = this.valueOfScopes(request);
    this.subdomain = this.valueOfSubdomain(request);
    this.authorization = this.getAuthorization(request.get("authorization"));
    this.fallback = this.getFallbackUrls(request);
  }

  private getFallbackUrls(request: OAuthRequestType): FallbackURI {
    const host = request.get("host") || "";
    const protocol = request.protocol;

    return {
      baseUrl: fmt("%s://%s", protocol, host),
      signInUrl: fmt("%s://%s/sign-in", protocol, host),
    };
  }

  private valueOfSubdomain(request: OAuthRequestType): string | null {
    return request.subdomains.shift() || null;
  }

  private getAuthorization(
    authorization: string | undefined
  ): AuthToken | null {
    if (!authorization) {
      return null;
    }

    if (authorization.startsWith("Basic")) {
      const base64encoded = authorization.substr("Basic".length + 1);
      const base64decoded = Buffer.from(base64encoded, "base64").toString();

      const [user, password] = base64decoded.split(":");

      const token: AuthToken = {
        type: "basic",
        value: base64encoded,
      };

      if (user && password) {
        token.user = user;
        token.password = password;
      }

      return token;
    } else if (authorization.startsWith("Bearer")) {
      return {
        type: "bearer",
        value: authorization.substr("Bearer".length + 1),
      };
    }

    return null;
  }

  /**
   * require client authentication for confidential clients or for any
   * client that was issued client credentials
   */
  ensureBasicCredentials(): Required<AuthToken> {
    const auth = this.authorization;

    /**
     * * There are few places where the authorization credentials are
     * * required. Thinking about moving this part to be member of GrantType class
     */
    if (!auth || auth.type !== "basic" || !auth.user || !auth.password) {
      const responseError = new TokenResponseError("invalid_client");
      responseError.set(
        "WWW-Authenticate",
        'Basic realm="Client" charset="UTF-8"'
      );
      responseError.status = 401;
      throw responseError;
    }

    return {
      type: auth.type,
      value: auth.value,
      user: auth.user,
      password: auth.password,
    };
  }

  private valueOfScopes(request: OAuthRequestType): Set<string> {
    let scope: string | null = null;

    if (typeof request.query.scope === "string") {
      scope = request.query.scope;
    } else if (typeof request.body.scope === "string") {
      scope = request.body.scope;
    }

    if (scope === null) {
      return new Set<string>();
    }

    /**
     * Scope value is a string that composed of the scope tokens
     * separated by "[space]" or "+" sign, ensure we support them both.
     *
     * [space]: "scope1+scope2"; SP unicode: \u0020
     * [+]    : "scope1 scope2"; SP unicode: \u002b
     */
    return new Set(decodeURIComponent(scope).split(/\u0020/g));
  }
}
