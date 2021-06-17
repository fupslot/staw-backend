import { Request } from "express";
import {
  AbstractRequest,
  TokenRequestBody,
  RequestParamsType,
} from "../abstract-request";
import { TokenResponseError } from "./token-response-error";
import { vRedirectUri, vCode, vState } from "../../../internal/validation";

type Body = Readonly<TokenRequestBody>;
type TokenRequestParams = TokenRequestBody & RequestParamsType;

export type TokenRequestType = Request<
  Pick<RequestParamsType, "serverAlias">,
  unknown,
  Body
>;

export class TokenRequest extends AbstractRequest<TokenRequestType> {
  public params: TokenRequestParams;

  constructor(request: TokenRequestType) {
    super(request);
    this.params = {
      ...request.params,
      ...request.body,
      subdomain: request.subdomain,
    };
  }

  async validate(): Promise<void> {
    if (this.params.grant_type !== "authorization_code") {
      throw new TokenResponseError(
        "invalid_grant",
        "The grant type 'grant_type' must be registered with the value 'authorization_code'"
      );
    }

    if (!(await vState.isValid(this.params.code_verifier))) {
      throw new TokenResponseError("invalid_request");
    }

    if (!(await vCode.isValid(this.params.code))) {
      throw new TokenResponseError("invalid_grant");
    }

    if (!(await vRedirectUri.isValid(this.params.redirect_uri))) {
      throw new TokenResponseError("invalid_grant");
    }
  }
}
