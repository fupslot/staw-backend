import path from "path";
import express, { Express, Request, Response, NextFunction } from "express";
import { Boom } from "@hapi/boom";

import { IAppContext } from "../../context";

// Routes
//   /d/ - dashboard

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Dashboard(ctx: IAppContext): Express {
  const d = express();

  d.set("views", path.resolve(__dirname, "../../views"));
  d.set("view engine", "ejs");

  d.get("/d", (req, res) => {
    if (req.isUnauthenticated()) {
      return res.redirect("/sign-in");
    }

    res.render("dashboard");
  });

  d.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: Boom | Error, req: Request, res: Response, next: NextFunction) => {
      console.error(error);

      res.render("500", { errorMessage: error.message });
    }
  );

  return d;
}
