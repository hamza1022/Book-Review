let router = require("express").Router();

router.use("/book", require("./book"));
router.use("/user", require("./user"));

module.exports = router;
