const config = require("./config.js");
const axios = require("axios");


exports.getTokens = async code => {

    const headers = { "Content-Type": 'application/x-www-form-urlencoded' };
    const params = {
        "grant_type": "authorization_code",
        "client_id": config.AWS_COGNITO_CLIENT_ID,
        "redirect_uri": config.AWS_REDIRECT_URL,
        "code": code
    };

    return await axios.post(`${config.AWS_COGNITO_DOMAIN}/oauth2/token`, params, { headers });
};
