const AWS = require("aws-sdk");
const config = require("./config.js");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const qrcode = require("qrcode");

const REGION = config.AWS_REGION;
const AWS_COGNITO_CLIENT_ID = config.AWS_COGNITO_CLIENT_ID;
const S3_BUCKET = config.AWS_BUCKET_NAME;

AWS.config.update({ region: REGION });
const cognito = new AWS.CognitoIdentityServiceProvider();
const s3 = new AWS.S3();

exports.userSignUp = async (password, email) => {
    const params = {
        ClientId: AWS_COGNITO_CLIENT_ID,
        Password: password,
        Username: email
    };
    return new Promise((resolve, reject) => {
        cognito.signUp(params, (error, data) => {
            if (data) resolve(data);
            if (error) reject(error);
        });
    });
};

exports.verifyUserEmail = async (email, code) => {
    const params = {
        ClientId: AWS_COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code
    };
    return new Promise((resolve, reject) => {
        cognito.confirmSignUp(params, (error, data) => {
            if (error) reject(error);
            if (data) resolve(data);
        });
    });
};

exports.userSignIn = async (email, password) => {
    const params = {
        ClientId: AWS_COGNITO_CLIENT_ID,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
            "PASSWORD": password,
            "USERNAME": email
        }
    };
    return new Promise((resolve, reject) => {
        cognito.initiateAuth(params, (error, data) => {
            if (error) reject(error);
            if (data) resolve(data);
        });
    });
};


exports.getAWSUser = async token => {
    const params = {
        AccessToken: token
    };
    return new Promise((resolve, reject) => {
        cognito.getUser(params, (error, data) => {
            if (error) reject(error);
            if (data) resolve(data);
        })

    });
};

exports.forgotPassword = async (email) => {
    const params = { ClientId: AWS_COGNITO_CLIENT_ID, Username: email };
    await cognito.forgotPassword(params).promise();
};

exports.confirmPasswordChange = async (password, code, email) => {
    const params = {
        ClientId: AWS_COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: password
    };
    await cognito.confirmForgotPassword(params).promise();
};

exports.uploadS3Object = async (type, file, userId) => {
    const params = {
        Bucket: S3_BUCKET,
        Key: `${type}/${userId}/${file.originalname}`,
        Body: file.buffer
    };
    return await s3.upload(params).promise();
};

exports.getS3Object = async key => {
    const params = {
        Bucket: S3_BUCKET,
        Key: key
    };
    return s3.getSignedUrl('getObject', params);
};

exports.connectWithAuthenticator = async ({ session, userId }) => {
    const response = await cognito.associateSoftwareToken({ Session: session, }).promise();
    const QRCode = await qrcode.toDataURL(`otpauth://totp/basteon?secret=${response["SecretCode"]}`);
    return { ...response, userId, QRCode };
};

exports.respondChallenges = async ({ challenge, session, userId, code }) => {
    return await cognito.respondToAuthChallenge({
        ClientId: AWS_COGNITO_CLIENT_ID,
        ChallengeName: challenge,
        Session: session,
        ChallengeResponses: {
            "USERNAME": userId,
            ...(!!code && { "SOFTWARE_TOKEN_MFA_CODE": code })
        }
    }).promise();
};

exports.verifyAuthenticator = async ({ code, session, userId }) => {
    const response = await cognito.verifySoftwareToken({ UserCode: code, Session: session }).promise();
    return await this.respondChallenges({ challenge: "MFA_SETUP", session: response["Session"], userId })
};

exports.changeMFASettings = async ({ token, enabled }) => {
    return await cognito.setUserMFAPreference({
        AccessToken:
            token,
        SoftwareTokenMfaSettings: { Enabled: enabled, PreferredMfa: enabled }
    }).promise();
};