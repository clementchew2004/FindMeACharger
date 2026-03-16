/*
This describes a charging points various opening times.
valid_from and valid_to is mostly so we could have seasonal opening times for the charging points.

i think wrapped closing times are valid, so we could have after dark opening times, like 21:00 to 04:00, we'd just have
to check for rollover.
*/

DO $$
BEGIN
IF NOT EXISTS (
SELECT 1
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname = 'day_of_week'
AND n.nspname = 'public'
) THEN
CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
END IF;
END
$$;



CREATE TABLE IF NOT EXISTS opening_times (
    opening_time_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    charging_point_id INT NOT NULL,
    day_of_week day_of_week NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL
);