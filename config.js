require("dotenv").config();

module.exports = {
    PORT: process.env["PORT"],

    DB_USER: process.env["DB_USER"],
    DB_PASSWORD: process.env["DB_PASSWORD"].toString(),
    DB_NAME: process.env["DB_NAME"],
    DB_HOST: process.env["DB_HOST"],
    DB_PORT: process.env["DB_PORT"],

    AWS_REGION: process.env["AWS_REGION"],
    AWS_COGNITO_CLIENT_ID: process.env["AWS_COGNITO_CLIENT_ID"],
    AWS_COGNITO_DOMAIN: process.env["AWS_COGNITO_DOMAIN"],
    AWS_BUCKET_NAME: process.env["AWS_BUCKET_NAME"],

    GOOGLE_CLIENT_ID: process.env["GOOGLE_CLIENT_ID"].trim(),
    GOOGLE_CLIENT_SECRET: process.env["GOOGLE_CLIENT_SECRET"].trim(),

    AWS_REDIRECT_URL : process.env["AWS_REDIRECT_URL"]
};