import { Express } from "express";
import { once } from "lodash";
import ExpressSession from "express-session";
import cookieParser from "cookie-parser";
import passport, { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { IAppContext } from "../context";

/**
 * Initializing the passport with the middleware strategies
 */

function _initialize(app: Express, ctx: IAppContext) {
  app.use(cookieParser());

  app.use(
    ExpressSession({
      name: ctx.config.SESSION_NAME,
      secret: ctx.config.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // * The use of the passport strategies must be defined inside the configuration file
  passport.use(
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      function verify(req, username, password, done) {
        console.log("username", username);
        console.log("password", password);
        done(null, false);
      }
    )
  );
}

interface Session {
  init(app: Express, ctx: IAppContext): void;
  passport: PassportStatic;
}

const s: Session = {
  init: once(_initialize),
  passport,
};

export default s;
