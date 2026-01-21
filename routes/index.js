const router = require("express").Router();

router.get("/test", (req, res) => {
  res.json({ message: "server ok" });
});

router.post("/echo", (req, res) => {
  res.json(req.body);
});

router.use("/", require("./auth.routes"));
router.use("/", require("./lists.routes"));
router.use("/", require("./todos.routes"));

module.exports = router;                                                                                             