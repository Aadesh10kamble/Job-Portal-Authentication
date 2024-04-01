const { query } = require('../initdb.js');
const { DatabaseError } = require('pg');
const { escapeSingleQuotes } = require('../utilsMiddleware.js');
const { uploadS3Object } = require('../utils.aws.js');


exports.createCompany = async (req, res) => {
    try {
        let company;
        const { companyName } = escapeSingleQuotes(req.body);
        const dbResponse = await query(`INSERT INTO company (company_name) VALUES (?) RETURNING *`, [companyName]);
        if (!dbResponse.rowCount) return res.failure("COMPANY_CREATION_FAILED");
        const companyId = dbResponse.rows[0].id;

        await query(`UPDATE user_job SET current_company_id=?`, [companyId]);
        
        if (req.file) {
            const { key } = await uploadS3Object("company-image", req.file, companyId)
            const updatedResponse = await query(`
            UPDATE company SET image_key=? WHERE id=? RETURNING *
            `, [key, companyId]);

            if (!updatedResponse.rowCount) return res.failure("COMPANY_UPDATE_FAILED");
            company = updatedResponse.rows[0];
        } else company = dbResponse.rows[0];

        return res.success(company);
    } catch (error) {
        return res.status(400).json(error);
    };
};

exports.getCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const dbResponse = await query(`'SELECT * FROM company WHERE id=?`,[companyId]);
        if (!dbResponse.rowCount) return res.failure("COMPANY_RETRIEVAL_FAILED");
        res.success(dbResponse.row[0]);
    } catch (error) {
        return res.status(400).json(error);
    };
};
