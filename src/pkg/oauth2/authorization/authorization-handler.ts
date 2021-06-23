import { Response } from "express";
import { AuthorizationResponseError } from "./";
import { is } from "../../../internal";

import { RequestHandler } from "../request";
import { CodeResponseType, TokenResponseType } from "../response-types";

export class AuthorizationHandler extends RequestHandler {
  async handle(res: Response): Promise<void> {
    const request = this.request;

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
        client,
        request,
        state,
      }).handle(res);
    } else if (responseType === "token") {
      return new TokenResponseType({
        model: this.model,
        site,
        client,
        request,
        state,
      }).handle(res);
    } else {
      throw new AuthorizationResponseError("unsupported_response_type");
    }
  }
}
