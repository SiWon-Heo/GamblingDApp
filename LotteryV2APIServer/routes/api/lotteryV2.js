const router = require("express").Router();

const LotteryV2Controller = require("../../controller/LotteryV2Controller");

router.post("/enter", LotteryV2Controller.enter);

module.exports = router;
