const express = require("express");
const { verifyToken,checkAuthority } = require("../utilsMiddleware");
const { createCompany } = require("../controller/company");
const router = express.Router();

const upload = require("multer")();

router.post("/create",verifyToken,checkAuthority,upload.single('companyImage'),createCompany);
router.get("/get-company/:companyId",verifyToken,)

module.exports = router;