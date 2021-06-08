import { createHash, createSign, createVerify, KeyObject } from "crypto";
import { randomString } from "./crypto";

interface PKCECode {
  challenge: string;
  hash: PKCECodeChallengeHash;
}

export type PKCEType = Required<PKCE>;
export type PKCECodeChallengeHash = "S265";

export type PKCECodeReturn = { hash: PKCECodeChallengeHash; value: string };

const unreserved_set =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";

function base64_urlencode(base64: string): string {
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function generate_verifier(): string {
  return randomString(43, unreserved_set);
}

function generate_challenge(code: string): string {
  return base64_urlencode(createHash("sha256").update(code).digest("base64"));
}

export function pkceChallenge(code_verifier?: string): {
  code_verifier: string;
  code_challenge: string;
} {
  if (!code_verifier) {
    code_verifier = generate_verifier();
  }

  const code_challenge = generate_challenge(code_verifier);

  return {
    code_verifier,
    code_challenge,
  };
}

export function returnCode(
  privateKey: KeyObject,
  pkce: PKCECode
): PKCECodeReturn {
  const dataToSign = `${pkce.challenge}:${pkce.hash}`;

  const sign = createSign("SHA256");
  sign.write(dataToSign);
  sign.end();

  const value = sign.sign(privateKey, "base64");

  return { value, hash: pkce.hash };
}

export function returnCodeVerify(
  publicKey: KeyObject,
  pkceCode: PKCECode,
  code: PKCECodeReturn
): boolean {
  const dataToSign = `${pkceCode.challenge}:${pkceCode.hash}`;

  const verify = createVerify("SHA256");
  verify.write(dataToSign);
  verify.end();
  return verify.verify(publicKey, code.value, "base64");
}

interface PKCE {
  pkceChallenge: typeof pkceChallenge;
  returnCode: typeof returnCode;
  returnCodeVerify: typeof returnCodeVerify;
}

export const pkce = {
  pkceChallenge: pkceChallenge,
  returnCode: returnCode,
  returnCodeVerify: returnCodeVerify,
} as PKCE;
