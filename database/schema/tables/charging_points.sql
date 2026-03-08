CREATE TABLE IF NOT EXISTS charging_points (
    charging_point_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id INT NOT NULL,
    charging_point_location VARCHAR,
    charging_point_description VARCHAR
);