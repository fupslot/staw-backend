import { pkceChallenge } from "../src/internal/crypto";

/**
 * Run: yarn pkce-challenge
 */

const [, , code_verifier] = process.argv;

const challenge = pkceChallenge(code_verifier);

console.log(`
  PKCE Challenge`);

console.log(`
  Code verifier: ${challenge.code_verifier}
  Code challenge: ${challenge.code_challenge}
`);
