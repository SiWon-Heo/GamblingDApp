const ContractUtil = require("./ContractUtil");
const contractUtil = new ContractUtil();

class LotteryV2Interactor {
    constructor() {
        this.#initializeContract();
    }

    async #initializeContract() {
        this.web3 = contractUtil.web3;
        this.LotteryV2 = await contractUtil.getContract("LotteryV2");
    }

    async enter(signer, pk, enterAmt) {
        const funcName = "enter";
        try {
            const gas = await this.LotteryV2.methods
                .enter()
                .estimateGas({ from: signer, value: this.enterAmt })
                .catch((revertReason) => {
                    throw new Error(`estimating gas error: ${revertReason}`);
                });

            const to = this.LotteryV2._address;
            const data = this.LotteryV2.methods.enter().encodeABI();
            const serializedTx = await contractUtil.signTransaction(
                signer,
                pk,
                to,
                gas,
                enterAmt,
                data
            );

            let txHash;
            await this.web3.eth
                .sendSignedTransaction(serializedTx)
                .on("transactionHash", async () => {
                    console.log(
                        `[${funcName}] transaction created! tx hash: ${tx}`
                    );
                    txHash = tx;
                });

            return {
                status: true,
                result: txHash,
                errMsg: null,
            };
        } catch (err) {
            console.error(`[${funcName}] err:`, err);
            return {
                status: false,
                result: null,
                errMsg: err.message,
            };
        }
    }
}

module.exports = LotteryV2Interactor;
