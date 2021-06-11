import { Request } from "express";
import Boom from "@hapi/boom";
import { OAuthParamsType } from "./authorization-request";
import {
  vClientId,
  vRedirectUri,
  vCode,
  vState,
  vClientSecret,
} from "../../../internal/validation";

type GrantType = "authorization_code";

interface RequestParams {
  grant_type: GrantType;
  code_verifier: string;
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}

type RequestParamsType = Readonly<Required<RequestParams>>;

export type Token = Request<OAuthParamsType, unknown, RequestParamsType>;

type TokenRequest = RequestParamsType & OAuthParamsType;

export async function TokenRequest(req: Token): Promise<TokenRequest> {
  if (!("site" in req)) {
    throw Boom.badRequest(
      "Access denied: attribute 'authorization_code' must be set to 'authorization_code'"
    );
  }

  if (req.body.grant_type !== "authorization_code") {
    throw Boom.badRequest(
      "Invalid required: attribute 'authorization_code' must be set to 'authorization_code'"
    );
  }

  if (!(await vState.isValid(req.body.code_verifier))) {
    throw Boom.badRequest(
      "Invalid required: attribute 'code_verifier' invalid"
    );
  }

  if (!(await vCode.isValid(req.body.code))) {
    throw Boom.badRequest("Invalid required: attribute 'code' invalid");
  }

  if (!(await vRedirectUri.isValid(req.body.redirect_uri))) {
    throw Boom.badRequest("Invalid required: attribute 'redirect_uri' invalid");
  }

  if (!(await vClientId.isValid(req.body.client_id))) {
    throw Boom.badRequest("Invalid required: attribute 'client_id' invalid");
  }

  if (!(await vClientSecret.isValid(req.body.client_secret))) {
    throw Boom.badRequest(
      "Invalid required: attribute 'client_secret' invalid"
    );
  }

  return { ...req.body, serverAlias: req.params.serverAlias };
}
