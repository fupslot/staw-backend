import { format as fmt } from "util";
import { randomBytes, createHash } from "crypto";

/**
 * Run: yarn pkce-secret
 */

console.log(
  "# Secret for siging and verifying PKCE authorization code. Keep'em it .env file\n"
);

const pkce_code_secret = createHash("sha256")
  .update(randomBytes(64))
  .digest("base64");

console.log(fmt("PKCE_AUTHORIZATION_CODE_SECRET=%s", pkce_code_secret));
console.log("\n");
