import { Site, OAuth2Server, OAuth2Client } from "@prisma/client";
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
        alias: alias,
      },
    });
  }

  async getClient(
    site: Site,
    server: OAuth2Server,
    clientId: string
  ): Promise<OAuth2Client | null> {
    return this.ctx.store.oAuth2Client.findFirst({
      where: {
        site_id: site.id,
        client_id: clientId,
      },
    });
  }

  /**
   * Generate authorization code value
   *
   * @param pkceStateObject
   * @param secret This value used to sign an authorization code
   * @returns Authorization code
   */
  generateAuthorizaionCode(
    pkceStateObject: PKCEStateObject,
    secret: string
  ): string {
    const authorizationCode = pkce.createAuthorizationCode(
      pkceStateObject,
      secret
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
