const router = require("express").Router();

router.use("/wallet", require("./wallet"));

module.exports = router;
