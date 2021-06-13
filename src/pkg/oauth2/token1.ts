import Boom from "@hapi/boom";
import { Router } from "express";
import { wrap, pkce } from "../../internal";
import { IAppContext } from "../context";

import {
  urlencoded,
  x_form_www_urlencoded_required,
  subdomain_required,
} from "../http";

import { TokenRequest, Token } from "./token-request";

export function createTokenRoute(ctx: IAppContext): Router {
  const token = Router();

  token.post(
    "/v1/token",
    urlencoded(),
    subdomain_required(),
    x_form_www_urlencoded_required(),
    wrap<Token>(async (req, res) => {
      const request = await TokenRequest(req);

      const oauthServer = await ctx.store.oAuth2Server.findFirst({
        where: {
          site_id: req.site?.id,
          name: request.serverAlias,
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
        request.code_verifier
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

      if (request.code !== authorizationCode) {
        throw Boom.badRequest(
          "Invalid required: attribute 'authorization_code' not verified"
        );
      }

      res.sendStatus(200);
    })
  );

  return token;
}
