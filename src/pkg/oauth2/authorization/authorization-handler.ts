import { Response } from "express";
import { is } from "../../../internal";
import { RequestHandler } from "../request";
import { CodeResponseType } from "../response-types";
import { HttpBadRequestError } from "../response-error";

export class AuthorizationHandler extends RequestHandler {
  async handle(res: Response): Promise<void> {
    const request = this.request;

    if (!(await is.unreserved36(request.params.serverAlias))) {
      throw new HttpBadRequestError("invalid_request", "invalid_server_alias");
    }

    if (!request.subdomain) {
      throw new HttpBadRequestError("access_denied", "subdomain_not_found");
    }

    if (request.query.client_secret) {
      throw new HttpBadRequestError(
        "invalid_request",
        "client_secret_not_allowed"
      );
    }

    const state = request.query.state;

    if (!(await is.nqchar(state))) {
      throw new HttpBadRequestError("invalid_request", "invalid_state");
    }

    const clientId = request.query.client_id;

    if (!(await is.vschar(clientId))) {
      throw new HttpBadRequestError("invalid_request", "client_id_not_valid");
    }

    const site = await this.model.getSite(request.subdomain);
    if (!site) {
      throw new HttpBadRequestError("access_denied", "access_denied");
    }

    const server = await this.model.getServer(request.params.serverAlias, site);
    if (!server) {
      throw new HttpBadRequestError("invalid_request", "invalid_request");
    }

    const client = await this.model.getClient(clientId, {
      site,
    });
    if (!client) {
      throw new HttpBadRequestError("access_denied", "access_denied");
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
    }

    throw new HttpBadRequestError("unsupported_response_type", "unsupported");
  }
}
