import {
  generateKeyPairSync,
  createSign,
  createVerify,
  createPublicKey,
  createPrivateKey,
} from "crypto";

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

console.log("\n==v Keys v==\n");

const public_key = publicKey.export({ format: "der", type: "spki" });
const private_key = privateKey.export({ format: "der", type: "pkcs8" });

const public_key_b64 = publicKey
  .export({ format: "der", type: "spki" })
  .toString("base64");
const private_key_b64 = privateKey
  .export({ format: "der", type: "pkcs8" })
  .toString("base64");

console.log("public_key", public_key_b64);
console.log("private_key", private_key_b64);

const newPublicKey = createPublicKey({
  key: public_key,
  type: "spki",
  format: "der",
});

const newPrivateKey = createPrivateKey({
  key: private_key,
  format: "der",
  type: "pkcs8",
});

console.log("\n==v Exported Keys v==\n");

console.log(
  "public_key",
  newPublicKey.export({ format: "der", type: "spki" }).toString("base64")
);
console.log(
  "private_key",
  newPrivateKey.export({ format: "der", type: "pkcs8" }).toString("base64")
);
