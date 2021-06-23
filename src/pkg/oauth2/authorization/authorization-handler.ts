import { Response } from "express";
import { AuthorizationResponseError } from "./";
import { is } from "../../../internal";

import { RequestHandler } from "../request";
import { CodeResponseType, TokenResponseType } from "../response-types";

export class AuthorizationHandler extends RequestHandler {
  async handle(res: Response): Promise<void> {
    const request = this.request;

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

    const client = await this.model.getClient(clientId, {
      site,
    });
    if (!client) {
      throw new AuthorizationResponseError("access_denied", state);
    }

    const responseType = request.query.response_type;

    if (responseType === "code") {
      return new CodeResponseType({
        state,
        model: this.model,
        site,
        client,
      }).handle(request, res);
    } else if (responseType === "token") {
      return new TokenResponseType({
        state,
        model: this.model,
        site,
        client,
      }).handle(request, res);
    } else {
      throw new AuthorizationResponseError("unsupported_response_type");
    }
  }
}
