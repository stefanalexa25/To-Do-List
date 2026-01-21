const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const authController = require("../controller/auth.controller");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);
router.get("/profile", requireAuth, authController.profile);


module.exports = router;