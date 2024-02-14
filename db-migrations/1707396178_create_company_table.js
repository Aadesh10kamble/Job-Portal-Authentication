exports.up = (knex) => knex.raw(`
CREATE TABLE company (
    id UUID NOT NULL DEFAULT gen_random_uuid () UNIQUE,
    company_name VARCHAR(255),
    image_key TEXT
);`);

exports.down = knex => knex.raw (`
    DROP TABLE company;
`)