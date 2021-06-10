export * from "./http";
export * from "./middleware";

export interface OptionalRequestParams {
  authz?: string;
}

export type OAuthParamsType = Readonly<
  Required<Pick<OptionalRequestParams, "authz">>
>;
