const { getAWSUser } = require("./utils.aws.js");
const { selectUser } = require('./initdb.js');


exports.escapeSingleQuotes = body => {
    const processedBody = {};
    for (let key of Object.keys(body)) {
        if (typeof body[key] === "string" && key !== "password") processedBody[key] = body[key].replaceAll("'", "''").trim();
        else processedBody[key] = body[key];
    };
    return processedBody;
};

exports.responseMethods = () => (req, res, next) => {
    res.success = data => res.status(200).json({ isSuccess: true, data });
    res.failure = message => res.status(200).json({ isSuccess: false, message });
    next();
};


exports.verifyToken = async (req, res, next) => {
    try {
        const bearer = req.headers["authorization"];
        if (!bearer) res.failure("NO_TOKEN_PROVIDED");
        const [_, token] = bearer.split(" ");

        const awsUser = await getAWSUser(token);
        const email = awsUser.UserAttributes?.find(attribute => attribute.Name === "email").Value;
        const id = awsUser.UserAttributes?.find(attribute => attribute.Name === "sub").Value;

        if (!email || !id) return res.failure("No user Found");
        const dbResponse = await selectUser(id, email);

        if (!dbResponse.rowCount) return res.failure("No User in the Database.");
        res.locals.user = dbResponse.rows[0];
        next();
    } catch (error) {
        res.status(400).json(error);
    };
};

//
exports.checkAuthority = async (req, res, next) => {
    try {
        const { user } = res.locals;
        if (user.role !== "employer") return res.failure("USER_NOT_AUTHORIZED");
        next();
    } catch (error) {
        res.status(400).json(error);
    };
};