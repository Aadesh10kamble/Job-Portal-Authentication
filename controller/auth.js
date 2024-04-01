const { query, selectUser, createUser } = require('../initdb.js');
const { DatabaseError } = require('pg');
const { getTokens } = require("../utils.oauth.js");
const { escapeSingleQuotes } = require('../utilsMiddleware.js');
const {
    userSignUp,
    verifyUserEmail,
    userSignIn,
    uploadS3Object,
    getS3Object,
    getAWSUser,
    respondChallenges,
    connectWithAuthenticator,
    verifyAuthenticator } = require('../utils.aws.js');

exports.signUp = async (req, res) => {
    try {
        let imageKey;
        const { role, phone, email, password } = escapeSingleQuotes(req.body);
        if (!role) return res.failure('Role is Required.')
        if (!email || !password) return res.failure('Credentials Required');

        const user = await userSignUp(password, email);
        if (req.file) {
            const { key } = await uploadS3Object("profile-picture", req.file, user.UserSub);
            if (key) imageKey = key;
        };

        const dbResponse = await query(
            `INSERT INTO user_job (id,email,phone,image_key,role) VALUES (?,?,?,?,?) RETURNING *`,
            [user.UserSub, email, phone || null, imageKey || null, role]);

        if (!dbResponse.rowCount) return res.failure("USER_CREATION_FAILED");
        return res.success(dbResponse.rows[0]);
    } catch (error) {
        console.log(error);
        if (error instanceof DatabaseError) {
            return res.status(400).json({ message: error.message });
        };
        res.failure(error.message);
    };
};

exports.signIn = async (req, res) => {
    try {
        const { email, password } = escapeSingleQuotes(req.body);
        if (!email || !password) return res.failure('Credentials Required');

        const response = await userSignIn(email, password);
        return res.success(response);
    } catch (error) {
        console.log(error);
        if (error instanceof DatabaseError) {
            return res.status(400).json({ message: error.message });
        };
        res.failure(error.message);
    };
};

exports.verifyUser = async (req, res) => {
    try {
        const { code, email } = escapeSingleQuotes(req.body);
        await verifyUserEmail(email, code);
        res.success(`${email} has been Verified.`);
    } catch (error) {
        console.log(error);
        if (error instanceof DatabaseError) {
            return res.status(400).json({ message: error.message });
        };
        res.failure(error.message);
    };
};

exports.getUser = async (req, res) => {
    try {
        const { user } = res.locals;
        if (!user) return res.failure("RETRIEVING_USER_FAILED");
        if (user.image_key) {
            await getS3Object(user.image_key);
        }
    } catch (error) {
        console.log(error);
        if (error instanceof DatabaseError) {
            return res.status(400).json({ message: error.message });
        };
        res.failure(error.message);
    };
};

exports.googleAuthentication = async (req, res) => {
    try {
        const { code } = req.query;
        const tokens = await getTokens(code);
        const { access_token: accessToken } = tokens.data;
        if (!accessToken) return res.failure("GOOGLE_AUTH_FAILED");

        const awsUser = await getAWSUser(accessToken);
        const email = awsUser.UserAttributes?.find(attribute => attribute.Name === "email").Value;
        const id = awsUser.UserAttributes?.find(attribute => attribute.Name === "sub").Value;


        const dbResponse = await selectUser(id, email);
        if (!dbResponse.rowCount) {
            const userResponse = await createUser({ userId: id, email, });
            if (!userResponse.rowCount) return res.failure("USER_CREATION_FAILED");
        };
        res.success(tokens.data);
    } catch (error) {
        console.log(error);
        if (error instanceof DatabaseError) {
            return res.status(400).json({ message: error.message });
        };
        res.failure(error.message);
    };
};

exports.associateWithAuthenticator = async (req, res) => {
    try {
        const { data } = req.body;
        const params = {
            challenge: data["ChallengeName"],
            session: data["Session"],
            userId: data["ChallengeParameters"]["USER_ID_FOR_SRP"]
        };
        const response = await connectWithAuthenticator(params);
        res.success(response);
    } catch (error) {
        console.log(error);
        if (error instanceof DatabaseError) {
            return res.status(400).json({ message: error.message });
        };
        res.failure(error.message);
    }
}

exports.realMFA = async (req, res) => {
    try {
        const { data, code,userId } = req.body;
        const params = {
            challenge: data["ChallengeName"],
            session: data["Session"],
            userId:userId,
            code
        };

        const response = await respondChallenges(params);
        res.success(response);
    } catch (error) {
        console.log(error);
        if (error instanceof DatabaseError) {
            return res.status(400).json({ message: error.message });
        };
        res.failure(error.message);
    }
}

exports.verifyTokenSoftware = async (req, res) => {
    try {
        const { code, session, userId } = req.body;
        const response = await verifyAuthenticator({ code, session, userId });
        res.success(response);
    } catch (error) {
        console.log(error);
        if (error instanceof DatabaseError) {
            return res.status(400).json({ message: error.message });
        };
        res.failure(error.message);
    }
}