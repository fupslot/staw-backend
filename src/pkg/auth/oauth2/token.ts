import Boom from "@hapi/boom";
import { Router, Request } from "express";
import { wrap, pkce } from "../../../internal";
import { IAppContext } from "../../context";
import {
  vClientId,
  vRedirectUri,
  vCode,
  vState,
  vClientSecret,
} from "../../../internal/validation";
import {
  urlencoded,
  x_form_www_urlencoded_required,
  subdomain_required,
  OAuthParamsType,
} from "../../http";

type GrantType = "authorization_code";

interface RequestParams {
  grant_type: GrantType;
  code_verifier: string;
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}

type RequestParamsType = Required<RequestParams>;

type TokenRequest = Request<OAuthParamsType, unknown, RequestParamsType>;

export function createTokenRoute(ctx: IAppContext): Router {
  const token = Router();

  token.post(
    "/v1/token",
    urlencoded(),
    subdomain_required(),
    x_form_www_urlencoded_required(),
    wrap<TokenRequest>(async (req, res) => {
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
        throw Boom.badRequest(
          "Invalid required: attribute 'redirect_uri' invalid"
        );
      }

      if (!(await vClientId.isValid(req.body.client_id))) {
        throw Boom.badRequest(
          "Invalid required: attribute 'client_id' invalid"
        );
      }

      if (!(await vClientSecret.isValid(req.body.client_secret))) {
        throw Boom.badRequest(
          "Invalid required: attribute 'client_secret' invalid"
        );
      }

      const oauthServer = await ctx.store.oAuth2Server.findFirst({
        where: {
          site_id: req.site?.id,
          name: req.params.authz,
        },
      });

      if (!oauthServer) {
        /**
         * MUST BE 'unauthorized_client'
         * @see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
         */
        throw Boom.badRequest(
          "Invalid required: attribute 'client_id' invalid"
        );
      }

      const pkceStateObject = await ctx.cache.oauth.getState(
        req.body.code_verifier
      );

      if (!pkceStateObject) {
        throw Boom.badRequest(
          "Invalid required: attribute 'code_verifier' invalid"
        );
      }

      const authorizationCode = pkce.createAuthorizationCode(
        pkceStateObject,
        ctx.config.PKCE_AUTHORIZATION_CODE_SECRET
      );

      if (req.body.code !== authorizationCode) {
        throw Boom.badRequest(
          "Invalid required: attribute 'authorization_code' not verified"
        );
      }

      res.sendStatus(200);
    })
  );

  return token;
}
