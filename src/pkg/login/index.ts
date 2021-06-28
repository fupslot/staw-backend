import path from "path";
import express, { Express, Request, Response, NextFunction } from "express";
import { Boom } from "@hapi/boom";
import { urlencoded } from "../http";
// import Session from "../session";

import { IAppContext } from "../context";
// import { createSignUpRoute } from "./sign-up";
// import { createInviteRoute } from "./invite";
// import { createOAuth2Route } from "./oauth2";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Login(ctx: IAppContext): Express {
  const auth = express();

  auth.set("views", path.resolve(__dirname, "../views"));
  auth.set("view engine", "ejs");

  auth.get("/sign-in", (req, res) => {
    res.render("sign-in");
  });

  auth.post("/sign-in", urlencoded(), (req, res) => {
    res.sendStatus(200);
  });

  // Session.passport.authenticate("local", {
  //   failureRedirect: "/sign-in",
  //   successRedirect: "/",
  // })

  auth.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: Boom | Error, req: Request, res: Response, next: NextFunction) => {
      console.error(error);

      res.render("500", { errorMessage: error.message });
    }
  );
  return auth;
}
