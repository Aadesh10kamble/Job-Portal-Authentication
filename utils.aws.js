const AWS = require("aws-sdk");
const config = require("./config.js");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
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
    console.log ("Enter!!");
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
    console.log("11-11")
    console.log(await s3.getObject(params).promise());
};

// exports.changeAttributes = async (token, email) => {
//     const params = {
//         AccessToken: token,
//         UserAttributes: {
//             "Name": "email",
//             "Value": email
//         }
//     };
//     await cognito.updateUserAttributes(params).promise();
// };

// exports.verifyAttributeChange = async (token,code) => {
//     const params = {
//         AccessToken : token,
//         Att
//     }
// }