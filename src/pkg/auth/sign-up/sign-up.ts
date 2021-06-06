import { Router, Request } from "express";
import { format as fmt } from "util";

import { addMinutes } from "date-fns";
import { IAppContext } from "../../context";
import { wrap } from "../../../internal/util";
import { urlencoded, x_form_www_urlencoded_required } from "../../http";
import { csprng } from "../../../internal/crypto";
import { validate, PostSignUpSchema } from "../../../internal/validation";
import Boom from "@hapi/boom";
import { send_invite } from "../../worker/mail";

interface SignUpParams {
  siteId: string;
  email: string;
}

type SignUpBodyParamsType = Required<SignUpParams>;
type SignUpRequest = Request<unknown, unknown, SignUpBodyParamsType>;

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
    x_form_www_urlencoded_required(),
    wrap<SignUpRequest>(async (req, res) => {
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

      const newSite = await ctx.store.site.create({
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

        include: {
          invites: true,
        },
      });

      ctx.worker.mail.dispatch(
        send_invite({
          site: newSite,
          invite: newSite.invites[0],
        })
      );

      res.sendStatus(201);
    })
  );

  return signUp;
}
