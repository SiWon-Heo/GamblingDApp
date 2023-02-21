const CipherUtil = require("../service/CipherUtil");
const ResponseHandler = require("../service/ResponseHandler");
const WalletDBInteractor = require("../service/db/WalletDBInteractor");
const errorCodes = require("../constants/errorCodes").errorCodes;
class WalletController {
    static async createWallet(req, res) {
        const funcName = "createWallet";
        try {
            const accountName = req.body.account_name;
            const account = req.body.account;
            // private key는 암호화해서 보관해야함 -> CipherUtil 구현 필요
            const privateKey = req.body.private_key;
            console.log(`[${funcName}] req.body: ${JSON.stringify(req.body)}`);

            const walletInfo = {
                account_name: accountName,
                account: account,
                private_key: CipherUtil.encrypt(privateKey),
            };
            console.log(
                `[${funcName}] walletInfo: ${JSON.stringify(walletInfo)}`
            );

            const inserted = await WalletDBInteractor.insertWallet(walletInfo);
            if (inserted.status == errorCodes.success) {
                return ResponseHandler.sendSuccess(
                    res,
                    "success",
                    201
                )({
                    status: "confirmed",
                });
            } else if (inserted.status == errorCodes.client_issue) {
                return ResponseHandler.sendClientError(
                    400,
                    req,
                    res,
                    "this account already exists in db"
                );
            } else {
                throw new Error(inserted.err);
            }
        } catch (err) {
            console.log(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }
}

module.exports = WalletController;
