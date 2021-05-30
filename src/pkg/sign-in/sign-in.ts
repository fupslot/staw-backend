import { Router } from "express";
import { format as fmt } from "util";

import { addMinutes, isAfter } from "date-fns";
import { IAppContext } from "pkg/context";
import { Dictionary, wrap } from "../../internal/util";
import { json } from "../../internal/middleware";
import { csprng } from "../../internal/crypto";
import { validate, PostSignInSchema } from "../../internal/validation";
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

      if (requestResult.siteId !== req.context.siteId) {
        throw Boom.badRequest();
      }

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

      await ctx.store.site.insertOne({
        siteId: requestResult.siteId,
        email: requestResult.email,
      });

      const code = csprng.generate(12);

      const protocol = req.protocol;
      const host = fmt("%s.%s", requestResult.siteId, ctx.config.DOMAIN);
      const inviteUrl = fmt("%s://%s/api/v1/invite/%s", protocol, host, code);

      await ctx.store.invite.insertOne({
        siteId: requestResult.siteId,
        code: code,
        expireAt: addMinutes(new Date(), 2),
      });

      console.log(inviteUrl);

      // const shortUrl = ctx.urlShortener.shorten(
      //   fmt("%s://%s/invite/?code=%s", protocol, host, code)
      // );

      // await ctx.email.sendInvite({ inviteUrl })

      res.sendStatus(201);
    })
  );

  signIn.get(
    "/invite/:code",
    wrap<{ code: string }>(async (req, res) => {
      const code = req.params.code;

      const siteId = req.context.siteId;
      const invite = await ctx.store.invite.findOne({
        code: code,
        siteId: siteId,
      });

      const protocol = req.protocol;
      const host = req.get("host");

      if (!invite || isAfter(new Date(), invite.expireAt)) {
        res.redirect(fmt("%s://%s/invite-fail", protocol, host));
        return;
      }

      await ctx.store.invite.findOneAndUpdate(
        { code, siteId },
        {
          $set: {
            expireAt: new Date(),
          },
        }
      );

      const redirectTo = fmt("%s://%s", protocol, host);
      res.redirect(redirectTo);
    })
  );

  return signIn;
}
