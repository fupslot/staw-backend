import { Site, OAuth2Server, OAuth2Application } from "@prisma/client";
import { pkce, PKCEStateObject } from "./utils";
import { IAppContext } from "../context";

export class OAuth2Model {
  ctx: IAppContext;
  constructor(ctx: IAppContext) {
    this.ctx = ctx;
  }

  async getSite(alias: string): Promise<Site | null> {
    return this.ctx.store.site.findFirst({
      where: {
        alias,
      },
    });
  }

  async getServer(site: Site, alias: string): Promise<OAuth2Server | null> {
    return this.ctx.store.oAuth2Server.findFirst({
      where: {
        site_id: site.id,
        name: alias,
      },
    });
  }

  async getClient(
    site: Site,
    server: OAuth2Server,
    clientId: string
  ): Promise<OAuth2Application | null> {
    return this.ctx.store.oAuth2Application.findFirst({
      where: {
        server_id: server.id,
        client_id: clientId,
      },
    });
  }

  generateAuthorizaionCode(
    client: OAuth2Application,
    pkceStateObject: PKCEStateObject
  ): string {
    const authorizationCode = pkce.createAuthorizationCode(
      pkceStateObject,
      client.client_secret
    );

    return authorizationCode;
  }

  async getState(state: string): Promise<PKCEStateObject | null> {
    return this.ctx.cache.oauth.getState(state);
  }

  async saveState(pkceStateObject: PKCEStateObject): Promise<void> {
    this.ctx.cache.oauth.saveState(pkceStateObject);
  }
}
