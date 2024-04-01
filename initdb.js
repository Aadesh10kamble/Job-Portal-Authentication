const knex = require('knex');
const config = require("./config.js");
const { DatabaseError } = require('pg');

let client;
const createClient = () => {
    const connection = `postgres://${config["DB_USER"]}:${config["DB_PASSWORD"]}@${config["DB_HOST"]}:${config["DB_PORT"]}/${config["DB_NAME"]}`;

    return knex({
        client: 'pg',
        connection,
        migrations: { directory: "./db-migrations" }
    });
};

const query = async (sql, params) => {
    try {
        const dbResponse = await client.raw(sql, params);
        console.log("Database Query Successful!");
        return dbResponse;
    } catch (error) {
        console.log("Database Query Failed ::: ", error);
        throw new DatabaseError(error);
    }
};

const createUser = async ({ userId, email, phone, imageKey, role }) => {
    if (!userId || !email) throw Error("REQUIRED_FIELD");
    const userRole = role || 'employee';

    return await query(
        `INSERT INTO user_job (id,email,phone,image_key,role) VALUES (?,?,?,?,?) RETURNING *`,
        [userId, email, phone || null, imageKey || null, userRole]);
};

const selectUser = async (id, email) => {
    try {
        const sql = `SELECT * FROM user_job WHERE id=? AND email=?`;
        const dbResponse = await query (sql,[id,email])
        return dbResponse;
    } catch (error) {
        console.log("Database Query Failed ::: ", error);
        throw new DatabaseError(error);
    }
};

const getPaginationList = async ({ tableName, whereColumn, whereValue, toSkip, pageSize }) => {
    return await query(
        `SELECT *,count(*) OVER() AS full_count FROM ? WHERE ? =? LIMIT ? OFFSET ?`,
        [tableName, whereColumn, whereValue, pageSize, toSkip]);
};

const initiateClient = async () => {
    client = createClient();
    await client.migrate.latest();
};


module.exports = {
    query,
    initiateClient,
    selectUser,
    createUser,
    getPaginationList
};


