import { User } from "@prisma/client";
import { IAppContext } from "../context";

export class SessionModel {
  constructor(private ctx: IAppContext) {}

  async findUserById(id: string, alias?: string): Promise<User | null> {
    if (typeof alias === "string") {
      return this.ctx.store.user.findFirst({
        where: {
          id,
          site: {
            alias,
          },
        },
      });
    }

    return this.ctx.store.user.findFirst({
      where: {
        id,
      },
    });
  }

  async findUserByUsername(
    username: string,
    alias: string
  ): Promise<User | null> {
    return this.ctx.store.user.findFirst({
      where: {
        username,
        site: {
          alias,
        },
      },
    });
  }
}
