import { Request } from "express";
type GrantType = "authorization_code" | "client_credentials" | "password";

interface RequestParams {
  grant_type: GrantType;
  code_verifier: string;
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}

type RequestParamsType = Readonly<RequestParams>;

export type TokenRequestType = Request<
  { serverAlias: string },
  unknown,
  RequestParamsType
>;

// export type TokenRequestType = RequestParamsType;
