import { format as fmt } from "util";
import { generateKeyPairSync, createSign, createVerify } from "crypto";

const { privateKey, publicKey } = generateKeyPairSync("ec", {
  namedCurve: "sect239k1",
});

/**
 * Run: yarn pkce-sign
 */

const sign = createSign("SHA256");
sign.write("code");
sign.end();

const signature = sign.sign(privateKey, "base64");

console.log("signature", signature);

const verify = createVerify("SHA256");
verify.write("code");
verify.end();

console.log(verify.verify(publicKey, signature, "base64"));

console.log(
  "# Public / Private keys for siging and verifying PKCE code. Keep'em in .env file\n"
);

const public_key = publicKey
  .export({ format: "der", type: "spki" })
  .toString("base64");
const private_key = privateKey
  .export({ format: "der", type: "pkcs8" })
  .toString("base64");

console.log(fmt("PKCE_PUBLIC_KEY=%s", public_key));
console.log(fmt("PKCE_PRIVATE_KEY=%s", private_key));
console.log("\n");
