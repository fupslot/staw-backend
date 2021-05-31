const boolTrue = ["True", "true", "1"];

export type IAppConfig = {
  DOMAIN: string;
  PORT: number;
  STORE_DB: string;
  STORE_URL: string;
  STORE_LOGGER: boolean;
  CACHE_URL: string;
  MAIL_APIKEY: string;
  MAIL_NOREPLY: string;
};

export const config: IAppConfig = {
  DOMAIN: process.env.DOMAIN || "example.net",

  PORT: parseInt(process.env.PORT || "") || 9000,

  STORE_DB: process.env.STORE_DB || "staw-dev",

  STORE_URL: process.env.STORE_URL || "mongodb://db0.example.net:27020",

  STORE_LOGGER: boolTrue.includes(process.env.STORE_LOGGER || "") || false,

  CACHE_URL: process.env.CACHE_URL || "redis://rd0.example.net:16379",

  MAIL_APIKEY:
    process.env.MAIL_APIKEY ||
    "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",

  /**
   * SendGrid will send mails on behalf of the email set in MAIL_NOREPLY.
   * Note that changing a sender email the SendGrid will require a domain authentication
   *
   * @see https://sendgrid.com/docs/ui/account-and-settings/how-to-set-up-domain-authentication/
   */
  MAIL_NOREPLY: "fdashlot@gmail.com",
};
