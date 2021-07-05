import { Express, RequestHandler } from "express";
import { once } from "lodash";
import ExpressSession from "express-session";
import cookieParser from "cookie-parser";
import passport, { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { IAppContext } from "../context";
import { SessionModel } from "./model";
/**
 * Initializing the passport with the middleware strategies
 */

function _initialize(app: Express, ctx: IAppContext) {
  const sessionModel = new SessionModel(ctx);

  app.use(cookieParser());

  app.use(
    ExpressSession({
      name: ctx.config.SESSION_NAME,
      secret: ctx.config.SESSION_SECRET,
      resave: true,
      saveUninitialized: false,
      cookie: { httpOnly: true, secure: true, sameSite: true },
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
        sessionModel
          .findUserByUsername(username, req.subdomain)
          .then((user) => {
            done(null, user ? user : false);
          })
          .catch(() => done(null, false));
      }
    )
  );

  passport.serializeUser<string>((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser<string>((id, done) => {
    sessionModel
      .findUserById(id)
      .then((user) => done(null, user ? user : false))
      .catch(() => {
        done(null, false);
      });
  });
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

export const sessionInit = once(_initialize);
export const authenticateLocal = (): RequestHandler =>
  passport.authenticate("local", {
    successRedirect: "/d/",
    failureRedirect: "/sign-in",
  });
