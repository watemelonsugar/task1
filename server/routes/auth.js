const router = require("express").Router();
const authController = require("../controllers/AuthController");
const valid = require("../middleware/valid");

router.post('/register', valid, authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
