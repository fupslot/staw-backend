import express, { Request, Response, NextFunction, Express } from "express";

import { urlencoded, x_form_www_urlencoded_required } from "./middleware";
import { IAppContext } from "../context";
import { wrap } from "../../internal";
import { OAuth2Server } from "./server";
import { OAuth2Model } from "./model";
import { AuthorizationResponseError } from "./authorization";
import { TokenResponseError } from "./token";
import { OAuthRequest, OAuthRequestType } from "./request";
import { HttpResponseError } from "./response-error";

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
      const request = new OAuthRequest(req);

      const model = new OAuth2Model(ctx);
      const server = new OAuth2Server(model);

      return await server.authorize(request, res);
    })
  );

  oauth2.post(
    "/oauth2/:serverAlias/v1/token",
    x_form_www_urlencoded_required(),
    wrap<OAuthRequestType>(async (req, res) => {
      const request = new OAuthRequest(req);

      const model = new OAuth2Model(ctx);
      const server = new OAuth2Server(model);

      return await server.token(request, res);
    })
  );

  oauth2.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: Error, req: Request, res: Response, next: NextFunction): void => {
      // todo: log error stack when in development mode only
      // console.error(error.toString());

      if (error instanceof HttpResponseError) {
        res.status(error.status).json(error);
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
