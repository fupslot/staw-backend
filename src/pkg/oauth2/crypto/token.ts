import { randomBytes, createHmac, createHash } from "crypto";

const alpha_digit_set = "0123456789abcdefghijklmnopqrstuvwxyz";
const UNRESERVED_CHARSET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";

function randomString(size: number, mask: string): string {
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

function base64URLEncode(base64: string): string {
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function generateVerifier(): string {
  return randomString(43, UNRESERVED_CHARSET);
}

function generateChallenge(code: string): string {
  return base64URLEncode(createHash("sha256").update(code).digest("base64"));
}

export type PKCECodeChallengeMethod = "S256";
export type PKCEAuthorizationCode = string;

export type PKCEState = {
  verifier: string;

  challenge: string;

  challenge_method: PKCECodeChallengeMethod;

  issued_to: string;

  redirect_uri?: string;
};

export function generatePKCEChallenge(code_verifier?: string): {
  code_verifier: string;
  code_challenge: string;
} {
  if (!code_verifier) {
    code_verifier = generateVerifier();
  }

  const code_challenge = generateChallenge(code_verifier);

  return {
    code_verifier,
    code_challenge,
  };
}

export function createAuthorizationCode(
  state: PKCEState,
  secret: string
): PKCEAuthorizationCode {
  return base64URLEncode(
    hmac_sha256(
      `${state.challenge}:${state.challenge_method}`,
      secret,
      "base64"
    )
  );
}

export function generateRefToken(size = 32): string {
  return randomString(size, UNRESERVED_CHARSET);
}
