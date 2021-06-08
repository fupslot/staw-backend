import { randomBytes } from "crypto";

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
