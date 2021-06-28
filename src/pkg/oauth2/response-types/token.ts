import { Response } from "express";
import { format as fmt } from "util";
import { is } from "../../../internal";
import { AuthorizationResponseError } from "../authorization";

import { ResponseType } from "./response-type";
export class TokenResponseType extends ResponseType {
  async handle(res: Response): Promise<void> {
    const request = this.request;

    if (!(await is.uri(request.query.redirect_uri))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        request.query.state
      );
    }

    if (
      !Array.isArray(this.client.redirect_uris) ||
      !this.client.redirect_uris.includes(request.query.redirect_uri)
    ) {
      throw new AuthorizationResponseError(
        "invalid_request",
        request.query.state
      );
    }

    const accessToken = this.model.generateAccessToken("base64url");

    const searchParams: [string, string][] = [];

    searchParams.push(["token_type", "bearer"]);
    searchParams.push(["access_token", accessToken]);
    searchParams.push(["expire_in", "" + this.client.access_token_lifetime]);
    searchParams.push(["state", request.query.state]);

    if (request.query.scope) {
      searchParams.push(["scope", encodeURIComponent(request.query.scope)]);
    }

    const uriComponent =
      this.client.response_deliver_method === "fragment_component" ? "#" : "?";

    const redirectUri = fmt(
      "%s%s%s",
      request.query.redirect_uri,
      uriComponent,
      new URLSearchParams(searchParams).toString()
    );

    res.set("Cache-Control", "no-store");
    res.set("Pragma", "no-cache");

    res.redirect(302, redirectUri);
    return Promise.resolve();
  }
}
