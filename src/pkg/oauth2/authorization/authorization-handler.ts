import { Response } from "express";
import { AuthorizationResponseError } from "./";
import { is } from "../../../internal";

import { RequestHandler } from "../request";
import { CodeResponseType, TokenResponseType } from "../response-types";

export class AuthorizationHandler extends RequestHandler {
  async handle(res: Response): Promise<void> {
    const request = this.request;
    // todo:
    // 1. checking that the request includes user session (session cookie)
    // 2. validate that the user authorized to access the requested subdomain (tenant)
    // 3. in case of the authentication failuer redirect the request to '/sign-in' endpoint.
    //    for the better user experience the failed request endpoint could be remembered
    //    for short period of time. the user will be redirected there after the succefull authentication

    if (!(await is.unreserved36(request.params.serverAlias))) {
      throw new AuthorizationResponseError("invalid_request");
    }

    if (!request.subdomain) {
      throw new AuthorizationResponseError("access_denied");
    }

    if (request.query.client_secret) {
      throw new AuthorizationResponseError(
        "invalid_request",
        request.query.state,
        "Ensure to avoid sending 'client_secret' via the request uri"
      );
    }

    const state = request.query.state;

    if (!(await is.nqchar(state))) {
      throw new AuthorizationResponseError("invalid_request");
    }

    const clientId = request.query.client_id;

    if (!(await is.vschar(clientId))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        request.query.state
      );
    }

    const site = await this.model.getSite(request.subdomain);
    if (!site) {
      throw new AuthorizationResponseError("access_denied", state);
    }

    const server = await this.model.getServer(request.params.serverAlias, site);
    if (!server) {
      throw new AuthorizationResponseError("invalid_request");
    }

    const client = await this.model.getClient(clientId, {
      site,
    });
    if (!client) {
      throw new AuthorizationResponseError("access_denied", state);
    }

    const responseType = request.query.response_type;

    if (responseType === "code") {
      return new CodeResponseType({
        model: this.model,
        site,
        server,
        client,
        request,
        state,
      }).handle(res);
    } else if (responseType === "token") {
      return new TokenResponseType({
        model: this.model,
        site,
        server,
        client,
        request,
        state,
      }).handle(res);
    } else {
      throw new AuthorizationResponseError("unsupported_response_type");
    }
  }
}
