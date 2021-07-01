import { Site, User as DBUser } from "@prisma/client";

interface CallbackURL {
  SIGN_IN_URL: string;
  SITE_BASE_URL: string;
  INVITE_FAIL_URL: string;
}

declare global {
  namespace Express {
    interface Request {
      subdomain: string;
      siteAlias: string;
      site: Site;
      user: DBUser | null;
      endpoint: CallbackURL;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends DBUser {}
  }
}

type ChannelType = "stable" | "unstable";

declare module "express-session" {
  interface SessionData {
    targetChannel?: ChannelType;
    user?: User;
  }
}
