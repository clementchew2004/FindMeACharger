ALTER TABLE charging_points
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6);

ALTER TABLE charging_points
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6);

ALTER TABLE charging_points
    ADD COLUMN IF NOT EXISTS shorthand_name VARCHAR(10);

ALTER TABLE charging_points
    ADD UNIQUE (shorthand_name);