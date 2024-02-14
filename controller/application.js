const { query, selectUser, createUser } = require('../initdb.js');
const { DatabaseError } = require('pg');
const { escapeSingleQuotes } = require('../utilsMiddleware.js');


exports.sendApplication = async (req, res) => {
    try {
        const { user: { id } } = req.locals;
        const { jobId } = escapeSingleQuotes(req.body);

        const dbResponse = await query(`INSERT INTO application (applied_by,resume_url,job_id) VALUES ('${id}',,'${jobId}')`);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    };
}