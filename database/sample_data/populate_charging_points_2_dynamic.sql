DO $$
DECLARE
    c_point RECORD;
BEGIN
    FOR c_point IN 
        SELECT
            charging_point_id
        FROM 
            charging_points
        WHERE
            shorthand_name IN ('BIR-NEWSTREET', 'TRURO-STATION', 'DUDLEY-BCLM', 'LDN-STPAULS')
        ORDER BY charging_point_id
    LOOP
        INSERT INTO charging_bays (charging_point_id, charging_bay_number, bay_type) VALUES
            (c_point.charging_point_id, 1, (SELECT bay_type_id FROM bay_types WHERE bay_type_name = 'USB-C')),
            (c_point.charging_point_id, 2, (SELECT bay_type_id FROM bay_types WHERE bay_type_name = 'Lightning'));
        
        INSERT INTO opening_times (charging_point_id, day_of_week, opening_time, closing_time) VALUES
            (c_point.charging_point_id, 'Monday', '08:00:00', '20:00:00'),
            (c_point.charging_point_id, 'Tuesday', '08:00:00', '20:00:00'),
            (c_point.charging_point_id, 'Wednesday', '08:00:00', '20:00:00'),
            (c_point.charging_point_id, 'Thursday', '08:00:00', '20:00:00'),
            (c_point.charging_point_id, 'Friday', '08:00:00', '20:00:00'),
            (c_point.charging_point_id, 'Saturday', '10:00:00', '18:00:00'),
            (c_point.charging_point_id, 'Sunday', '10:00:00', '18:00:00');
    END LOOP;
END $$;