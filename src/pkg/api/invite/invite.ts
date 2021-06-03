import { Router } from "express";
import { format as fmt } from "util";
import { isAfter } from "date-fns";
import { IAppContext } from "pkg/context";
import { wrap } from "../../../internal/util";

export function createInviteRoute(ctx: IAppContext): Router {
  const invite = Router();

  invite.get(
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

  return invite;
}
