import { randomBytes, createHmac, createHash } from "crypto";

const alpha_digit_set = "0123456789abcdefghijklmnopqrstuvwxyz";

export function randomString(size: number, mask: string): string {
  let result = "";

  const randomOctets = randomBytes(size);
  const byteLength = Math.pow(2, 8); // 256
  const maskLength = Math.min(mask.length, byteLength);

  // the factor breaks down the possible values of bytes (0x00-0xFF)
  // into the range of mask indices
  const factor = byteLength / maskLength;
  for (let i = 0; i < size; i++) {
    const idx = Math.floor(randomOctets[i] / factor);
    result += mask[idx];
  }

  return result;
}

export function randomAlphaDigit(size = 16): string {
  return randomString(size, alpha_digit_set);
}

export function hmac_sha256(
  value: string,
  secret: string,
  encoding: BufferEncoding
): string {
  return createHmac("SHA256", secret).update(value).digest().toString(encoding);
}

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
  state: PKCEStateObject,
  secret: string
): PKCEAuthorizationCode {
  return base64_urlencode(
    hmac_sha256(`${state.challenge}:${state.hash}`, secret, "base64")
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
