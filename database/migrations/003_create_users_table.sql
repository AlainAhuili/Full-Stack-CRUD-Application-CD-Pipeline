-- EXPAND PHASE
-- Create the users authentication schema.
-- Existing system components can run without interaction with this new entity.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alter existing resource tables to support ownership models.
-- We must allow NULL temporarily to prevent breaking current in-flight transactional code.
ALTER TABLE items ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) DEFAULT NULL;
