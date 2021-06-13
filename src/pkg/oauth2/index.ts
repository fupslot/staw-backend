import express, { Request, Response, NextFunction, Express } from "express";
import { format as fmt } from "util";

import { urlencoded } from "./middleware";
import { IAppContext } from "../context";
import { wrap } from "../../internal";
import { OAuth2Server } from "./server";
import { OAuth2Model } from "./model";
import {
  AuthorizationRequestType,
  AuthorizationRequest,
  AuthorizationResponseError,
  AuthorizationResponse,
  FallbackURI,
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
      const subdomain = req.subdomains.shift() || undefined;
      if (!subdomain) {
        throw new AuthorizationResponseError("access_denied");
      }

      req.subdomain = subdomain;

      const protocol = req.protocol;
      const host = req.get("host");

      const fallbackURI: FallbackURI = {
        SITE_BASE: fmt("%s://%s", protocol, host),
        SIGN_IN: fmt("%s://%s/sign-in", protocol, host),
      };

      const request = new AuthorizationRequest(req, fallbackURI);

      const model = new OAuth2Model(ctx);
      const server = new OAuth2Server(model);

      try {
        return server.authorize(request, res);
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
      const subdomain = req.subdomains.shift() || undefined;
      if (!subdomain) {
        throw new AuthorizationResponseError("access_denied");
      }

      req.subdomain = subdomain;

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

      if (error instanceof AuthorizationResponse) {
        res.redirect(error.status, error.getRedirectUrl("callback_uri"));
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
