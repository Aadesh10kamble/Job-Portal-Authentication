exports.up = (knex) => knex.raw(`
CREATE TABLE application (
    id UUID NOT NULL DEFAULT gen_random_uuid () UNIQUE,
    applied_by UUID REFERENCES user_job (id) ON DELETE CASCADE,
    resume_url TEXT,
    job_id UUID REFERENCES job (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`);

exports.down = knex => knex.raw (`
    DROP TABLE application;
`)

// application_status VARCHAR DEFAULT 'pending' CHECK (application_status IN ('pending','rejected','approved'))