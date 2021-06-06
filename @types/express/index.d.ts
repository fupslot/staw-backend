import { Site, User } from "@prisma/client";

interface CallbackURL {
  SIGN_IN_URL: string;
  SITE_BASE_URL: string;
  INVITE_FAIL_URL: string;
}

declare global {
  namespace Express {
    interface Request {
      siteId: string | null;
      site: Site | null;
      user: User | null;
      endpoint: CallbackURL;
    }
  }
}

type ChannelType = "stable" | "unstable";

declare module "express-session" {
  interface SessionData {
    targetChannel: ChannelType | null;
  }
}
