CREATE TABLE IF NOT EXISTS organisations (
    organisation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_name VARCHAR(255) NOT NULL UNIQUE,
    organisation_owner_id INT
);