import { pkceChallenge } from "../src/internal/crypto";

/**
 * Run: yarn pkce-challenge
 */

const [, , code_verifier] = process.argv;

const challenge = pkceChallenge(code_verifier);

console.log(`
  PKCE Challenge:`);

console.log(`
  code_verifier (state): ${challenge.code_verifier}
  challenge:             ${challenge.code_challenge}
  hash:                  S256

  query:                 &state=${challenge.code_verifier}&code_challenge=${challenge.code_challenge}&code_challenge_hash=S256
`);
