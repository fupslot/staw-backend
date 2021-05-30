import { Router } from "express";
import { IAppContext } from "pkg/context";
import { Dictionary, wrap } from "../../internal/util";
import { json } from "../../internal/middleware";
import { validate, PostSignInSchema } from "../../internal/validation";
import { format as fmt } from "util";
import Boom from "@hapi/boom";

type SignInBody = {
  siteId: string;
  email: string;
};

export function createSignInRouter(ctx: IAppContext): Router {
  const signIn = Router();

  /**
   * POST /sign-in
   *
   * @see http://openproject.example.net/projects/secure-trust-access-web/wiki/api-reference#register-new-site
   */
  signIn.post(
    "/sign-in",
    json(),
    wrap<Dictionary<string>, unknown, SignInBody, unknown>(async (req, res) => {
      const requestResult = await validate(PostSignInSchema, req.body);

      const site = await ctx.store.site.findOne({
        siteId: requestResult.siteId,
      });

      if (site) {
        throw Boom.badRequest(
          fmt('Requested siteId "%s" has already exists', requestResult.siteId),
          {
            siteId: requestResult.siteId,
          }
        );
      }

      // await ctx.store.site.insertOne({
      //   siteId: requestResult.siteId,
      //   email: requestResult.email,
      // });

      // const code = crypto.csprng.random(32);
      // const protocol = req.protocol;
      // const host = req.get('host');
      // const shortUrl = ctx.urlShortener.shorten(
      //   fmt("%s://%s/invite/?code=%s", protocol, host, code)
      // );

      // GET {HOST}/invite/?code={alphanum:32}

      res.sendStatus(201);
    })
  );

  return signIn;
}
