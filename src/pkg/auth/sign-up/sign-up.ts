import { Router } from "express";
import { format as fmt } from "util";

import { addMinutes } from "date-fns";
import { IAppContext } from "../../context";
import { wrap, QueryParams, ResBody, ReqBody } from "../../../internal/util";
import { urlencoded } from "../../http";
import { csprng } from "../../../internal/crypto";
import { validate, PostSignUpSchema } from "../../../internal/validation";
import Boom from "@hapi/boom";

type SignUpRequestBody = {
  siteId: string;
  email: string;
} & ReqBody;

export function createSignUpRoute(ctx: IAppContext): Router {
  const signUp = Router();

  /**
   * POST /sign-in
   *
   * @see http://openproject.example.net/projects/secure-trust-access-web/wiki/api-reference#register-new-site
   */
  signUp.post(
    "/sign-up",
    urlencoded(),
    wrap<QueryParams, ResBody, SignUpRequestBody>(async (req, res) => {
      if (!req.is("application/x-www-form-urlencoded")) {
        throw Boom.badRequest("invalid_request");
      }

      const reqParams = await validate(PostSignUpSchema, req.body);

      const siteExist = await ctx.store.site.findFirst({
        where: {
          alias: reqParams.siteId,
        },
      });

      if (siteExist) {
        throw Boom.badRequest(
          fmt('Requested siteId "%s" has already exists', reqParams.siteId),
          {
            siteId: reqParams.siteId,
          }
        );
      }

      const code = csprng.generate(12);

      const protocol = req.protocol;
      const host = fmt("%s.%s", reqParams.siteId, ctx.config.DOMAIN);
      const inviteUrl = fmt("%s://%s/invite/%s", protocol, host, code);

      await ctx.store.site.create({
        data: {
          display_name: reqParams.siteId,
          alias: reqParams.siteId,
          invites: {
            create: {
              code,
              invite_uri: inviteUrl,
              email: reqParams.email,
              expire_at: addMinutes(new Date(), 60), // todo
            },
          },
        },
      });

      // ctx.worker.dispatch(send_invite_worker({ }))
      ctx.email.sendInvite({
        sendTo: reqParams.email,
        siteId: reqParams.siteId,
        url: inviteUrl,
      });

      res.sendStatus(201);
    })
  );

  return signUp;
}
