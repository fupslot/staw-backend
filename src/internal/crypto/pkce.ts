import { createHash } from "crypto";
import { randomString, hmac_sha256 } from "./crypto";

export type PKCECodeChallengeHash = "S265";
export type PKCEStateObject = {
  state: string;
  challenge: string;
  hash: PKCECodeChallengeHash;
};

export type PKCEAuthorizationCode = string;

export type PKCECodeReturn = { hash: PKCECodeChallengeHash; value: string };

const UNRESERVED_CHARSET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";

function base64_urlencode(base64: string): string {
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function generate_verifier(): string {
  return randomString(43, UNRESERVED_CHARSET);
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

export function createAuthorizationCode(
  state: PKCEStateObject
): PKCEAuthorizationCode {
  return base64_urlencode(
    hmac_sha256(`${state.challenge}:${state.hash}`, "base64")
  );
}

interface PKCE {
  pkceChallenge: typeof pkceChallenge;
  createAuthorizationCode: typeof createAuthorizationCode;
}

export const pkce = {
  pkceChallenge: pkceChallenge,
  createAuthorizationCode: createAuthorizationCode,
} as PKCE;
