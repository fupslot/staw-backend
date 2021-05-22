type SiteId = string | null;

interface ISite {
  siteId: SiteId;
}

type IRequestContext = {
  reqId: string;
  site?: ISite | null;
};

declare namespace Express {
  interface Request {
    context: IRequestContext;
  }
}
