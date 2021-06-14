import express from "express";
import { OAuth2Model } from "./model";
import { AuthorizationHandler, AuthorizationRequest } from "./authorization";

import {} from "./";

export class OAuth2Server {
  model: OAuth2Model;

  constructor(model: OAuth2Model) {
    this.model = model;
  }

  /**
   * The authorization endpoint is used to interact with the resource
   * owner and obtain an authorization grant.  The authorization server
   * MUST first verify the identity of the resource owner.  The way in
   * which the authorization server authenticates the resource owner
   * (e.g., username and password login, session cookies) is beyond the
   * scope of this specification.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-3.1
   * @returns Promise<void>
   */
  async authorize(
    request: AuthorizationRequest,
    res: express.Response
  ): Promise<void> {
    return new AuthorizationHandler({ model: this.model }).handler(
      request,
      res
    );
  }

  /**
   * The token endpoint is used by the client to obtain an access token by
   * presenting its authorization grant or refresh token.  The token
   * endpoint is used with every authorization grant except for the
   * implicit grant type (since an access token is issued directly).
   *
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-3.2
   * @returns Promise<void>
   */
  async token(): Promise<void> {
    return;
  }

  /**
   * Token Introspection
   *
   * The introspection endpoint is an OAuth 2.0 endpoint that takes a
   * parameter representing an OAuth 2.0 token and returns a JSON
   * [RFC7159] document representing the meta information surrounding the
   * token, including whether this token is currently active
   *
   * @see https://datatracker.ietf.org/doc/html/rfc7662#section-2
   * @returns Promise<void>
   */
  async introspection(): Promise<void> {
    return;
  }
}
