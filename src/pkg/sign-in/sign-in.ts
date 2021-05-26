import { Router } from "express";
import { IAppContext } from "pkg/context";
import { Dictionary, wrap } from "../../internal/util";
import { json } from "../../internal/middleware";
import { validate, submitSignInSchema } from "../../internal/validation";

type SignInBody = {
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
      const result = await validate(submitSignInSchema, req.body);
      console.log(result.email);
      res.sendStatus(200);
    })
  );

  return signIn;
}
