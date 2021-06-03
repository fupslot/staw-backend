import { Router } from "express";
import { format as fmt } from "util";
import { isAfter } from "date-fns";
import { IAppContext } from "pkg/context";
import { subdomain_required, urlencoded } from "../../http";
import { validate, InviteParamsSchema } from "../../../internal/validation";
import { wrap, QueryParams, ResBody, ReqBody } from "../../../internal/util";

type InviteQuery = {
  code: string;
};

export function createInviteRoute(ctx: IAppContext): Router {
  const invite = Router();

  invite.get(
    "/invite",
    urlencoded(),
    subdomain_required(),
    wrap<QueryParams, ResBody, ReqBody, InviteQuery>(async (req, res) => {
      const params = await validate(InviteParamsSchema, req.query);
      const code = params.code;

      const siteId = req.context.siteId;
      const invite = await ctx.store.invite.findOne({
        code: code,
        siteId: siteId,
      });

      const protocol = req.protocol;
      const host = req.get("host");

      if (!invite || isAfter(new Date(), invite.expireAt)) {
        res.redirect(fmt("%s://%s/invite/fail", protocol, host));
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

  invite.get(
    "/invte/fail",
    subdomain_required(),
    wrap(async (req, res) => {
      res.sendStatus(404);
    })
  );

  return invite;
}
