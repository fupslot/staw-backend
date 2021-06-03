type SiteId = string | null;

interface ISite {
  siteId: SiteId;
}

type IRequestContext = {
  reqId: string;
  siteId: string | null;
  site?: ISite | null;
};

declare namespace Express {
  interface Request {
    context: IRequestContext;
  }
}
