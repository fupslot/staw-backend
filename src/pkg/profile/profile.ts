import { Router } from "express";
import { IAppContext } from "pkg/context";
import { Dictionary, wrap } from "../../internal/util";
import { json, urlencoded } from "../../internal/middleware";
import { validate, submitProfileSchema } from "../../internal/validation";

type ProfileParams = Dictionary<string>;
type ProfileBody = {
  first_name: string;
  last_name: string;
  email: string;
};
type ProfileQuery = ProfileParams;
type ProfileReturn = unknown;

export function createProfileRouter(ctx: IAppContext): Router {
  const profile = Router();

  profile.get(
    "/",
    wrap(async (req, res) => {
      res.sendStatus(200);
    })
  );

  profile.get("/q", (req, res) => {
    req.params;
    res.send();
  });

  profile.post(
    "/",
    json(),
    urlencoded(),
    wrap<ProfileParams, ProfileReturn, ProfileBody, ProfileQuery>(
      async (req, res) => {
        const result = await validate(submitProfileSchema, req.body);

        result?.email;
        req.query.email;
        req.body.last_name;
        req.params.first_name;
        res.sendStatus(200);
      }
    )
  );

  return profile;
}
