exports.up = (knex) => knex.raw(`
CREATE TABLE job (
    id UUID NOT NULL DEFAULT gen_random_uuid () UNIQUE,
    company_id UUID REFERENCES company (id) ON DELETE CASCADE,
    isActive BOOLEAN DEFAULT true,
    required_skills TEXT,
    title VARCHAR(255) NOT NULL,
    opening INTEGER DEFAULT 1,
    description TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`);

exports.down = knex => knex.raw (`
    DROP TABLE job;
`)