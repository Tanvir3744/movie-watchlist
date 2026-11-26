import crypto from "node:crypto";
import { promisify } from "node:util";

// declare the encyption method
const scrypt = promisify(crypto.scrypt);

export const passwordVarification = async (password, storedHash) => {
  // separate the salt and rest encrypted password
  const [salt, storedKeyHex] = storedHash.split(":");

  // invalid stored hash password check
  if (!salt || !storedKeyHex) {
    return false;
  }

  // decrypt the stored password
  const storedkey = Buffer.from(storedKeyHex, "hex");
  const hashCurrentPassword = await scrypt(password, salt, 64);

  // if current password is not equals to stored password
  if (storedkey.length !== hashCurrentPassword.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashCurrentPassword, storedkey);
};
