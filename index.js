const express = require("express");
const config = require("./config.js");

const bodyParser = require("body-parser");
const { initiateClient } = require("./initdb.js");
const { escapeSingleQuotes, responseMethods } = require("./utilsMiddleware.js");

const router = require("./routes/index.js");

const upload = require("multer")();

const app = express();
// app.use(upload.array ("aa"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(responseMethods());
// app.use(escapeSingleQuotes());


app.use("/v1", router);

app.listen(config.PORT, async () => {
    initiateClient();
    console.log(`App Listening in :: http://localhost:${config.PORT}`);
});