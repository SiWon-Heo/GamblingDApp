const ResponseHandler = require("../service/ResponseHandler");
const WalletDBInteractor = require("../service/db/WalletDBInteractor");
const errorCodes = require("../constants/errorCodes").errorCodes;
const LotteryV2Interactor = require("../service/contract/LotteryV2Interactor");
const lotteryv2interactor = new LotteryV2Interactor();
const CipherUtil = require("../service/CipherUtil");

class LotteryV2Controller {
    static async enter(req, res) {
        const funcName = "enter";
        try {
            // POST 요청을 받는다고 가정해서 body에 메타데이터가 들어갈 것임.
            const accountName = req.body.account_name;
            const enterAmt = req.body.enter_amt;
            console.log(`[${funcName}] req.body: ${JSON.stringify(req.body)}`);

            const wallet = await WalletDBInteractor.getWallet(accountName);
            console.log(`[${funcName}] wallet: ${JSON.stringify(wallet)}`);
            if (wallet.status == errorCodes.client_issue) {
                return ResponseHandler.sendClientError(
                    400,
                    req,
                    res,
                    "this account doesn't exist in db."
                );
            } else if (wallet.status == errorCodes.server_issue) {
                throw new Error(wallet.err);
            }

            // Interactor는 정제된 정보로 정해진 작업을 하는 개념, Controller는 Interactor를 위해 잡다한 처리를 해서 넘겨줘야한다.
            const enterResult = await lotteryv2interactor.enter(
                wallet.result.account,
                CipherUtil.decrypt(wallet.result.private_key),
                enterAmt
            );
            if (!enterResult.status) {
                throw new Error(enterResult.errMsg);
            }
            return ResponseHandler.sendSuccess(
                res,
                "success",
                200
            )({
                status: "Confirmed",
                tx_hash: enterResult.result,
            });
        } catch (err) {
            console.log(`[${funcName}] err:`, err);
            return ResponseHandler.sendServerError(req, res, err);
        }
    }
}

module.exports = LotteryV2Controller;
