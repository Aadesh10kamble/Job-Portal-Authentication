const { query, selectUser, createUser, getPaginationList } = require('../initdb.js');
const { DatabaseError } = require('pg');
const { escapeSingleQuotes } = require('../utilsMiddleware.js');
const { uploadS3Object, getS3Object } = require('../utils.aws.js');

exports.sendApplication = async (req, res) => {
    try {
        const { user: { id } } = req.locals;
        const { jobId } = escapeSingleQuotes(req.body);

        if (req.file) return res.failure("RESUME_REQUIRED");

        const resumeUrl = await uploadS3Object("resume", req, file, id);
        const dbResponse = await query(
            `INSERT INTO application (applied_by,job_id,resume_url) VALUES (?,?,?)`,
            [id, jobId, resumeUrl]);

        res.success({ message: "Application Send.", data: dbResponse.rows[0] })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    };
};


/* 
Employer Only
Get All Application for a JOB
*/
exports.getAllApplications = async (req, res) => {
    try {
        const { user: { id } } = req.locals;
        let { jobId, pageNumber, pageSize } = req.query;
        pageNumber = pageNumber || 1;
        pageSize = pageSize || 10;

        toSkip = pageSize * (pageNumber - 1);

        const dbResponse = await getPaginationList({
            tableName: "application",
            whereColumn: "job_id",
            whereValue: jobId,
            toSkip, pageSize
        });

        res.success(dbResponse);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    };
};

exports.downloadApplicationResume = async (req, res) => {
    try {
        const { applicationId } = req.query;
        const dbResponse = await query(
            'SELECT resume_url FROM application WHERE id=?',
            [applicationId]);

        const fileKey = dbResponse.rows[0].resume_url;
        if (!fileKey) return res.failure("RESUME_NOT_FOUND");
        const s3ObjectUrl = await getS3Object(fileKey);
        res.success(s3ObjectUrl);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};
/* 
Employee Only
Get Employee's Application
*/