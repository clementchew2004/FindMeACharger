CREATE TABLE IF NOT EXISTS operators (
    operator_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    organisation_id INT NOT NULL
);