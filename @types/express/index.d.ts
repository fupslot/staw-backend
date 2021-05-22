type IRequestContext = {
  reqId: string;
  siteId?: string | null;
};

declare namespace Express {
  interface Request {
    context: IRequestContext;
  }
}
