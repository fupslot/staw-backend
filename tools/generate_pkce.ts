import { printJSON } from "../src/internal";
import { pkceChallenge } from "../src/internal/crypto";

/**
 * Run: yarn pkce-challenge
 */

const [, , code_verifier] = process.argv;

const challenge = pkceChallenge(code_verifier);

console.log(printJSON(challenge));
