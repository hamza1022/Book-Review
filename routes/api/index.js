let router = require("express").Router();

router.use("/book", require("./book"));

module.exports = router;
