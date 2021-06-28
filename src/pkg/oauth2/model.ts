import { differenceWith } from "lodash";
import { Site, Scope, OAuth2Server, OAuth2Client } from "@prisma/client";
import { IAppContext } from "../context";
import {
  PKCEState,
  createAuthorizationCode,
  generateRefToken,
  formatBase64url,
  formatBase64,
} from "./crypto/token";

type ModelOptions = {
  site: Site;
};

export type OAuth2ServerType = OAuth2Server & {
  scopes: Scope[];
};

type OutputFormat = "bear" | "base64" | "base64url";

export class OAuth2Model {
  private ctx: IAppContext;

  constructor(ctx: IAppContext) {
    this.ctx = ctx;
  }

  generateAccessToken(format: OutputFormat = "bear"): string {
    if (format === "base64url") {
      return formatBase64url(generateRefToken(48));
    } else if (format === "base64") {
      return formatBase64(generateRefToken(48));
    }

    return generateRefToken(48);
  }

  generateRefreshToken(): string {
    return generateRefToken(64);
  }

  async getSite(alias: string): Promise<Site | null> {
    return this.ctx.store.site.findFirst({
      where: {
        alias,
      },
    });
  }

  async getServer(alias: string, site: Site): Promise<OAuth2ServerType | null> {
    return this.ctx.store.oAuth2Server.findFirst({
      where: {
        site_id: site.id,
        alias: alias,
      },
      include: {
        scopes: true,
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

  /**
   *
   * @param requestedScopes - The list of scopes the client requested the authorization server
   * @param acceptedScopes  - The list of scope the authorization server accepted
   * @returns The list of scope the authorization server granted to the client
   */
  valueOfScope(
    requestedScopes: Set<string>,
    acceptedScopes: Set<Scope>
  ): Set<string> | null {
    const isDefault = (value: Scope) => value.is_default;
    const fieldValue = (scope: Scope) => scope.value;

    if (requestedScopes.size === 0) {
      const defaultScopes = [...acceptedScopes]
        .filter(isDefault)
        .map(fieldValue);

      return new Set(defaultScopes);
    } else {
      const allScopes = [...acceptedScopes].map(fieldValue);
      const scopeDiff = differenceWith([...requestedScopes], [...allScopes]);

      if (scopeDiff.length > 0) {
        return null;
      }
    }

    return requestedScopes;
  }
}

export abstract class IOAuth2Model {
  protected model: OAuth2Model;

  constructor(opts: { model: OAuth2Model }) {
    this.model = opts.model;
  }
}
