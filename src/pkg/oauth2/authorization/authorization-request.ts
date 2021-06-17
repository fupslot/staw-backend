import { Request } from "express";
import {
  vClientId,
  vState,
  vScope,
  vRedirectUri,
  vCodeChallenge,
  vCodeChallengeHash,
} from "../../../internal/validation";
import { AuthorizationResponseError } from "./authorization-response-error";
import {
  AbstractRequest,
  RequestParamsType,
  AuthorizationQueryParams,
} from "../abstract-request";

type AuthorizationRequestParams = AuthorizationQueryParams & RequestParamsType;

type Params = Readonly<AuthorizationQueryParams>;
export type AuthorizationRequestType = Request<
  Pick<RequestParamsType, "serverAlias">,
  unknown,
  unknown,
  Params
>;

export class AuthorizationRequest extends AbstractRequest<AuthorizationRequestType> {
  public params: AuthorizationRequestParams;

  constructor(req: AuthorizationRequestType) {
    super(req);
    this.params = { ...req.params, ...req.query, subdomain: req.subdomain };
  }

  async validate(): Promise<void> {
    if (!this.subdomain) {
      throw new AuthorizationResponseError("access_denied");
    }

    if (this.params.client_secret) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (this.params.response_type !== "code") {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state,
        `The response type 'response_type' must be registered with the value 'code' but found only '${this.params.response_type}' instead`
      );
    }

    if (!(await vClientId.isValid(this.params.client_id))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vState.isValid(this.params.state))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vScope.isValid(this.params.scope))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vRedirectUri.isValid(this.params.redirect_uri))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vCodeChallenge.isValid(this.params.code_challenge))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }

    if (!(await vCodeChallengeHash.isValid(this.params.code_challenge_hash))) {
      throw new AuthorizationResponseError(
        "invalid_request",
        this.params.state
      );
    }
  }
}
