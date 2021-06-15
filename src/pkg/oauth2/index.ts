import express, { Request, Response, NextFunction, Express } from "express";

import { urlencoded } from "./middleware";
import { IAppContext } from "../context";
import { wrap } from "../../internal";
import { OAuth2Server } from "./server";
import { OAuth2Model } from "./model";
import {
  AuthorizationRequestType,
  AuthorizationRequest,
  AuthorizationResponseError,
} from "./authorization";
import { TokenRequestType, TokenResponseError } from "./token";

/**
 * OAuth2 Server Framework
 *
 * @returns Express
 */
export function OAuth2(ctx: IAppContext): Express {
  const oauth2 = express();

  oauth2.use(urlencoded());

  oauth2.get(
    "/oauth2/:serverAlias/v1/authorize",
    wrap<AuthorizationRequestType>(async (req, res) => {
      const request = new AuthorizationRequest(req);

      const model = new OAuth2Model(ctx);
      const server = new OAuth2Server(model);

      try {
        const response = await server.authorize(request);

        res.set(response.headers);
        res.redirect(response.status, response.getRedirectUrl());

        return;
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
    wrap<TokenRequestType>(async (req, res) => {
      // const request new TokenRequest(req);

      res.sendStatus(400);
      return;
    })
  );

  oauth2.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: Error, req: Request, res: Response, next: NextFunction): void => {
      if (error instanceof AuthorizationResponseError) {
        res.redirect(error.status, error.getRedirectUri("callback_uri"));
        return;
      }

      if (error instanceof TokenResponseError) {
        res.statusCode = error.status;
        res.json(error.valueOf());
        return;
      }

      res.sendStatus(500);
    }
  );

  return oauth2;
}
