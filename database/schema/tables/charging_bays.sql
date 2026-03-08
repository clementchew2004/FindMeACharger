CREATE TABLE IF NOT EXISTS charging_bays (
    charging_bay_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    charging_point_id INT NOT NULL,
    charging_bay_number INT NOT NULL,
    bay_type INT NOT NULL
);