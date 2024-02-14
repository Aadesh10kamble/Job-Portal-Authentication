const { query } = require('../initdb.js');
const { DatabaseError } = require('pg');
const { escapeSingleQuotes } = require('../utilsMiddleware.js');


exports.postJob = async (req, res) => {
    try {
        const { user } = res.locals;
        const { id, current_company_id: companyId } = user;
        if (!companyId) return res.failure("COMPANY_ID_REQUIRED");

        const { requiredSkills, title, opening, description, location } = escapeSingleQuotes(req.body);
        if (!title) return res.failure("TITLE_REQUIRED");

        let fields = 'company_id,title,required_skills,opening,description,location';
        let values = `'${companyId}','${title}',
        ${requiredSkills ? '`${requiredSkills}`' : null},
        ${opening || 1},${description ? '`${description}`' : null},
        ${location ? '`${location}`' : null}`;

        const dbResponse = await query(`INSERT INTO job (${fields}) VALUES (${values}) RETURNING *`);
        if (!dbResponse.rowCount) return res.failure("JOB_CREATION_FAILED");

        res.success(dbResponse.rows[0]);
    } catch (error) {
        res.status(400).json(error);
    };
};

exports.getJobs = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { searchText = '', pageNumber } = req.query;

        const offSet = (pageNumber * 10) - 10;
        const dbResponse = await query(`SELECT * FROM job 
        WHERE company_id='${companyId}' AND title LIKE '%${searchText}%'
        LIMIT 10 OFFSET ${offSet}
        `);

        const jobs = dbResponse.rows;

        res.success({ count: jobs.length, data: jobs })
    } catch (error) {
        res.status(400).json(error);
    };
};