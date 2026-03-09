ALTER TABLE opening_times
    ALTER COLUMN valid_from DROP NOT NULL,
    ALTER COLUMN valid_to DROP NOT NULL;