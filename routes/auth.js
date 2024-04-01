const express = require("express");
const { signUp, verifyUser,signIn, getUser, googleAuthentication, MFA,verifyTokenSoftware, realMFA,associateWithAuthenticator } = require("../controller/auth");
const { verifyToken } = require("../utilsMiddleware");
const router = express.Router();

const upload = require("multer")();

router.post("/signup", upload.single('profilePic'), signUp);
router.post("/verify-user",verifyUser);
router.post("/login",signIn);
router.get ("/test",verifyToken,getUser);
router.get("/google",googleAuthentication);
router.put ("/mfa-verify",associateWithAuthenticator);
router.put ("/mfa-verify-1",verifyTokenSoftware);
router.put ("/mfa-verify-2",realMFA);

module.exports = router;