const express = require ("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/", function (req, res) {
    console.log (req.locals);
    return res.status(200).json({ message: "Server Live" });
});

fs.readdirSync(__dirname).filter(fileName => fileName !== "index.js").forEach(file => {
    const routes = require (path.join(__dirname,file));
    router.use(`/${file.split(".")[0]}`,routes);
});

module.exports = router;