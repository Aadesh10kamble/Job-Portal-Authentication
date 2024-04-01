const AWS = require("aws-sdk");
AWS.config.update({ region: REGION });

const ses = new AWS.SES();

exports.sendEmail = async (toEmail) => {
    const params = {
        Source: 'xyza22734@gmail.com',
        Destination: {
            ToAddresses: [toEmail],
        },
        Message: {
            Body: {},
            Subject: {}
        }
    };
    return ses.sendEmail(params).promise();
};