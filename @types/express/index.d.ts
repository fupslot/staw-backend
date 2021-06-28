import { Site, User } from "@prisma/client";

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
      user: User | null;
      endpoint: CallbackURL;
    }
  }
}

type ChannelType = "stable" | "unstable";

declare module "express-session" {
  interface SessionData {
    targetChannel?: ChannelType;
    user?: User;
  }
}
