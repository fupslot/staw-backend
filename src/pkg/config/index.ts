const boolTrue = ["True", "true", "1"];

export type IAppConfig = {
  DOMAIN: string;
  PORT: number;
  STORE_LOGGER: boolean;
  CACHE_URL: string;
  MAIL_APIKEY: string;
  MAIL_NOREPLY: string;
  DATABASE_URL: string;
};

export const config: IAppConfig = {
  DOMAIN: process.env.DOMAIN || "example.net",

  PORT: parseInt(process.env.PORT || "") || 9000,

  STORE_LOGGER: boolTrue.includes(process.env.STORE_LOGGER || "") || false,

  CACHE_URL: process.env.CACHE_URL || "redis://rd0.example.net:6379",

  MAIL_APIKEY:
    process.env.MAIL_APIKEY ||
    "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",

  /**
   * SendGrid will send mails on behalf of the email set in MAIL_NOREPLY.
   * Note that changing a sender email the SendGrid will require a domain authentication
   *
   * @see https://sendgrid.com/docs/ui/account-and-settings/how-to-set-up-domain-authentication/
   */
  MAIL_NOREPLY: process.env.MAIL_NOREPLY || "fdashlot@gmail.com",

  /**
   * Environment variables declared in this file are automatically made available to Prisma.
   * See the documentation for more detail: https://pris.ly/d/prisma-schema#using-environment-variables
   *
   * Prisma supports the native connection string format for PostgreSQL, MySQL and SQLite.
   * See the documentation for all the connection string options: https://pris.ly/d/connection-strings
   */

  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@pdb0.example.net:5432/staw",
};
