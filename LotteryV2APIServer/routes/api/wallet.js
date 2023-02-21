const router = require("express").Router();

const WalletController = require("../../controller/WalletController");

router.post("", WalletController.createWallet);

// http://localhost:3000/wallet POST

module.exports = router;
