import Boom from "@hapi/boom";
import { Router, Request } from "express";
import { wrap, pkce, PKCECodeReturn, PKCECode } from "../../../internal";
import { IAppContext } from "../../context";
import { vClientId, vRedirectUri, vCode } from "../../../internal/validation";
import {
  urlencoded,
  x_form_www_urlencoded_required,
  subdomain_required,
  OAuthParamsType,
} from "../../http";

type GrantType = "authorization_code";

interface RequestParams {
  grant_type: GrantType;
  code: string;
  redirect_uri: string;
  client_id: string;
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

      const pkceReturnCode: PKCECodeReturn = {
        value: req.body.code,
        hash: "S265",
      };

      const pkceCode: PKCECode = {
        challenge: "",
        hash: "S265",
      };

      if (
        !pkce.returnCodeVerify(
          ctx.config.PKCE_PUBLIC_KEY,
          pkceCode,
          pkceReturnCode
        )
      ) {
        throw Boom.badRequest(
          "Invalid required: attribute 'code' not verified"
        );
      }

      res.sendStatus(200);
    })
  );

  return token;
}
