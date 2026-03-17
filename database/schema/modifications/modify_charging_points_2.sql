ALTER TABLE charging_points
    DROP COLUMN IF EXISTS charging_point_description;

ALTER TABLE charging_points
    ALTER COLUMN latitude TYPE DECIMAL(10, 8);

ALTER TABLE charging_points
    ALTER COLUMN longitude TYPE DECIMAL(11, 8);