exports.up = (knex) => knex.raw(`
CREATE TABLE user_job (
    id UUID NOT NULL DEFAULT gen_random_uuid () UNIQUE,
    current_company_id UUID REFERENCES company (id),
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('employee','employer')),
    phone VARCHAR(50) CHECK(regexp_replace(phone,'[\/\s\(\)+-]','','g') ~ '^\d*$'),
    user_uid VARCHAR(100) UNIQUE,
    image_key TEXT,
    email VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`);

exports.down = knex => knex.raw (`
    DROP TABLE user;
`)


// resume_key TEXT NOT NULL