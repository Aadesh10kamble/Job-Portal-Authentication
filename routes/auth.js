const express = require("express");
const { signUp, verifyUser,signIn, getUser, googleAuthentication } = require("../controller/auth");
const { verifyToken } = require("../utilsMiddleware");
const router = express.Router();

const upload = require("multer")();

router.post("/signup", upload.single('profilePic'), signUp);
router.post("/verify-user",verifyUser);
router.post("/login",signIn);
router.get ("/test",verifyToken,getUser);
router.get("/google",googleAuthentication);

module.exports = router;