import express, { Request, Response, NextFunction, Express } from "express";
import { Boom } from "@hapi/boom";

import { urlencoded, x_form_www_urlencoded_required } from "./middleware";
import { IAppContext } from "../context";
import { wrap } from "../../internal";
import { OAuth2Server } from "./server";
import { OAuth2Model } from "./model";
import { AuthorizationResponseError } from "./authorization";
import { TokenResponseError } from "./token";
import { OAuthRequest, OAuthRequestType } from "./request";
/**
 * OAuth2 Server Framework
 *
 * @returns Express
 */
export function OAuth2(ctx: IAppContext): Express {
  const oauth2 = express();

  oauth2.use(urlencoded());
  oauth2.disable("x-powered-by");

  oauth2.get(
    // "/oauth2/:site/v1/authorize",
    "/oauth2/:serverAlias/v1/authorize",
    wrap<OAuthRequestType>(async (req, res) => {
      try {
        const request = new OAuthRequest(req);

        const model = new OAuth2Model(ctx);
        const server = new OAuth2Server(model);

        return await server.authorize(request, res);
      } catch (error) {
        if (!(error instanceof AuthorizationResponseError)) {
          console.error(error);
          throw new AuthorizationResponseError("access_denied");
        }

        throw error;
      }
    })
  );

  oauth2.post(
    "/oauth2/:serverAlias/v1/token",
    x_form_www_urlencoded_required(),
    wrap<OAuthRequestType>(async (req, res) => {
      try {
        const request = new OAuthRequest(req);

        const model = new OAuth2Model(ctx);
        const server = new OAuth2Server(model);

        return await server.token(request, res);
      } catch (error) {
        if (!(error instanceof TokenResponseError)) {
          console.error(error);
          throw new TokenResponseError("invalid_request");
        }

        throw error;
      }
    })
  );

  oauth2.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: Error, req: Request, res: Response, next: NextFunction): void => {
      console.error(error);

      if (error instanceof Boom) {
        res.json(error);
        return;
      }

      if (error instanceof AuthorizationResponseError) {
        res.redirect(error.status, error.getRedirectUri("callback_uri"));
        return;
      }

      if (error instanceof TokenResponseError) {
        res.statusCode = error.status;
        res.set(error.headers);
        res.json(error.valueOf());
        return;
      }

      res.statusCode = 500;
      res.json({
        error: "internal_error",
      });
    }
  );

  return oauth2;
}
