import { Router, Request } from "express";
import { wrap } from "../../../../internal";
import { urlencoded } from "../../middleware";
import { IAppContext } from "../../../context";
import { authenticateLocal } from "../../../session";

type GetSignInRequest = Request<unknown>;

interface PostSignInReqBody {
  username: string;
  password: string;
  remember: boolean;
}
type PostSignInRequest = Request<unknown, unknown, PostSignInReqBody>;

export function SignIn(ctx: IAppContext): Router {
  const r = Router();

  r.get(
    "/sign-in",
    wrap<GetSignInRequest>(async (req, res) => {
      if (req.isAuthenticated()) {
        return res.redirect("/d/");
      }

      console.log(JSON.stringify(req.cookies, null, 2));
      console.log(JSON.stringify(req.session, null, 2));

      res.render("sign-in");
    })
  );

  r.post(
    "/sign-in",
    urlencoded(),
    authenticateLocal(),
    wrap<PostSignInRequest>(async (req, res) => {
      req.body.remember;
      res.sendStatus(200);
    })
  );

  return r;
}
