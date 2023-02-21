const crypto = require("crypto");
const IV_LENGTH = 16;
const path = requrie("path");
const envType = process.env.NODE_ENV || "development";
require("dotenv").config({
    path: path.join(__dirname, `../config/${envType}.env`),
});
class CipherUtil {
    static encrypt(text) {
        const funcName = "encrypt";
        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv(
                "aes-256-cbc",
                // ENCRYPTION_KEY from goerli.env, but it can be any random string of length 32.
                Buffer.from(process.env.ENCRYPTION_KEY),
                iv
            );
            const encrypted = cipher.update(text);

            return (
                iv.toString("hex") +
                ":" +
                Buffer.concat([encrypted, cipher.final()]).toString("hex")
            );
        } catch (err) {
            console.log(`[${funcName}] err`, err);
            return err;
        }
    }

    static decrypt(text) {
        const funcName = "decrypt";
        try {
            const textParts = text.split(":");
            const iv = Buffer.from(textParts.shift(), "hex");
            const encryptedText = Buffer.from(textParts.join(":"), "hex");
            const decipher = crypto.createDecipheriv(
                "aes-256-cbc",
                Buffer.from(process.env.ENCRYPTION_KEY),
                iv
            );
            const decrypted = decipher.update(encryptedText);

            return Buffer.concat([decrypted, decipher.final()]).toString();
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return err;
        }
    }
}

module.exports = CipherUtil;
