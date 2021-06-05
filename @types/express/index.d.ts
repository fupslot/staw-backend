type SiteId = string | null;

interface ISite {
  id: number;
  alias: string;
}

declare namespace Express {
  interface Request {
    siteId: string | null;
    site?: ISite | null;
    locals: {
      SIGN_IN_URL: string;
      SITE_BASE_URL: string;
      INVITE_FAIL_URL: string;
    };
  }
}
