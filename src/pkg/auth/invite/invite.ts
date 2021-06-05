import { Router } from "express";
import { isAfter } from "date-fns";
import { IAppContext } from "pkg/context";
import {
  subdomain_required,
  urlencoded,
  x_form_www_urlencoded_required,
} from "../../http";
import { validate, InviteParamsSchema } from "../../../internal/validation";
import { wrap, QueryParams, ResBody, ReqBody } from "../../../internal/util";

type InviteQuery = {
  code: string;
};

type InviteSubmit = InviteQuery;

export function createInviteRoute(ctx: IAppContext): Router {
  const invite = Router();

  invite.use(urlencoded());
  invite.use(subdomain_required());

  invite.get(
    "/invite",
    wrap<QueryParams, ResBody, ReqBody, InviteQuery>(async (req, res) => {
      const params = await validate(InviteParamsSchema, req.query);

      const invite = await ctx.store.invite.findFirst({
        where: {
          code: params.code,
          site: {
            id: req.site?.id,
          },
        },
      });

      if (!invite || isAfter(new Date(), invite.expire_at)) {
        return res.redirect(req.locals.INVITE_FAIL_URL);
      }

      res.sendStatus(200);
    })
  );

  invite.post(
    "/invite",
    x_form_www_urlencoded_required(),
    wrap<QueryParams, ResBody, InviteSubmit>(async (req, res) => {
      const body = await validate(InviteParamsSchema, req.body);
      const code = body.code;

      const invite = await ctx.store.invite.findFirst({
        where: {
          code: code,
          site: {
            id: req.site?.id,
          },
        },
      });

      if (!invite || isAfter(new Date(), invite.expire_at)) {
        res.redirect(req.locals.INVITE_FAIL_URL);
        return;
      }

      await ctx.store.invite.update({
        data: {
          active: false,
          expire_at: new Date(),
        },
        where: { id: invite.id },
      });

      res.redirect(req.locals.SIGN_IN_URL);
    })
  );

  invite.get(
    "/invite/fail",
    subdomain_required(),
    wrap(async (req, res) => {
      res.send("Seem no invite to me!");
    })
  );

  return invite;
}
