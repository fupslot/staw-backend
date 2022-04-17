import { Response } from "express";
import { AuthorizationResponseError } from "./";
import { is } from "../../../internal";

import { RequestHandler } from "../request";
import { CodeResponseType, TokenResponseType } from "../response-types";

export class AuthorizationHandler extends RequestHandler {
  async handle(res: Response): Promise<void> {
    const request = this.request;

    if (!(await is.unreserved36(request.params.serverAlias))) {
      // todo: respond with 400 Bad Request instead of 302 Found
      throw new AuthorizationResponseError(
        "invalid_request",
        request.query.state,
        "invalid_server_alias"
      );
    }

    if (!request.subdomain) {
      // todo: respond with 400 Bad Request instead of 302 Found
      throw new AuthorizationResponseError(
        "access_denied",
        request.query.state,
        "subdomain_not_found"
      );
    }

    if (request.query.client_secret) {
      // todo: respond with 400 Bad Request instead of 302 Found
      throw new AuthorizationResponseError(
        "invalid_request",
        request.query.state,
        "client_secret_not_allowed"
      );
    }

    const state = request.query.state;

    if (!(await is.nqchar(state))) {
      // todo: respond with 400 Bad Request instead of 302 Found
      throw new AuthorizationResponseError("invalid_request");
    }

    const clientId = request.query.client_id;

    if (!(await is.vschar(clientId))) {
      // todo: respond with 400 Bad Request instead of 302 Found
      throw new AuthorizationResponseError(
        "invalid_request",
        request.query.state,
        "client_id_not_valid"
      );
    }

    const site = await this.model.getSite(request.subdomain);
    if (!site) {
      // todo: respond with 400 Bad Request instead of 302 Found
      throw new AuthorizationResponseError("access_denied", state);
    }

    const server = await this.model.getServer(request.params.serverAlias, site);
    if (!server) {
      // todo: respond with 400 Bad Request instead of 302 Found
      throw new AuthorizationResponseError("invalid_request");
    }

    const client = await this.model.getClient(clientId, {
      site,
    });
    if (!client) {
      // todo: respond with 400 Bad Request instead of 302 Found
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
