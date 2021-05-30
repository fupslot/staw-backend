const boolTrue = ["True", "true", "1"];

export type IAppConfig = {
  DOMAIN: string;
  STORE_DB: string;
  STORE_URL: string;
  STORE_LOGGER: boolean;
  CACHE_URL: string;
};

export const config: IAppConfig = {
  DOMAIN: process.env.DOMAIN || "example.net",

  STORE_DB: process.env.STORE_DB || "staw-dev",

  STORE_URL: process.env.STORE_URL || "mongodb://db0.example.net:27017",

  STORE_LOGGER: boolTrue.includes(process.env.STORE_LOGGER || "") || false,

  CACHE_URL: process.env.CACHE_URL || "redis://rd0.example.net:6379",
};
