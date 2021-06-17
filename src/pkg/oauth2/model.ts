import { Site, OAuth2Server, OAuth2Client } from "@prisma/client";
import { IAppContext } from "../context";
import { PKCEState, createAuthorizationCode } from "./crypto/pkce";

type ModelOptions = {
  site: Site;
};

export class OAuth2Model {
  private ctx: IAppContext;

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
    clientId: string,
    opts: ModelOptions
  ): Promise<OAuth2Client | null> {
    return this.ctx.store.oAuth2Client.findFirst({
      where: {
        site_id: opts.site.id,
        client_id: clientId,
      },
    });
  }

  /**
   * Generate the authorization code string value.
   * Associate 'challenge' and 'challenge_method' values with the authorization code
   * so it can be verified later.
   *
   * @param pkceState PKCE state object
   * @param secret This value used to sign an authorization code
   * @returns Authorization code
   */
  generateAuthorizaionCode(pkceState: PKCEState, secret: string): string {
    return createAuthorizationCode(pkceState, secret);
  }

  async findPKCEState(state: string): Promise<PKCEState | null> {
    return this.ctx.storeCache.pkceStore.get(state);
  }

  async savePKCEState(pkceState: PKCEState): Promise<void> {
    this.ctx.storeCache.pkceStore.set(pkceState);
  }
}
