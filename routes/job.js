const express = require("express");
const { verifyToken,checkAuthority } = require("../utilsMiddleware");
const { postJob,getJobs } = require("../controller/job");
const router = express.Router();

const upload = require("multer")();

router.post("/create",verifyToken,checkAuthority,postJob);
router.get("/get-job/:jobId",verifyToken,)
router.get("/get-jobs/:companyId",verifyToken,getJobs);

module.exports = router;