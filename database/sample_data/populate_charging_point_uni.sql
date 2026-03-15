INSERT INTO "user" (name, public_name, email) VALUES
('isaac_lemon_grape', 'Isaac McCannon', 'isaacm@example.com');

INSERT INTO organisations (organisation_name) VALUES
('Lemon Grape Charging Co.');

INSERT INTO operators (user_id, organisation_id) VALUES
    (
        (SELECT id FROM "user" WHERE name = 'isaac_lemon_grape'),
        (SELECT organisation_id FROM organisations WHERE organisation_name = 'Lemon Grape Charging Co.')
    );

UPDATE organisations 
    SET organisation_owner_id = (SELECT operator_id FROM operators WHERE user_id = (SELECT id FROM "user" WHERE name = 'isaac_lemon_grape'))
    WHERE organisation_name = 'Lemon Grape Charging Co.';

INSERT INTO charging_points (owner_id, charging_point_location, latitude, longitude, shorthand_name) VALUES
    (
        (SELECT organisation_id FROM organisations WHERE organisation_name = 'Lemon Grape Charging Co.'),
        'Westgate, Birmingham, B15 2GB',
        52.450963,
        -1.935958,
        'WESTGATE'
    );

INSERT INTO localised_charging_point_descriptions (charging_point_id, locale_id, charging_point_description) VALUES
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        (SELECT locale_id FROM locales WHERE country_code = 'UK'),
        'A busy charging point located just outside of the University train station. Perfect for students!'
    );


INSERT INTO charging_bays (charging_point_id, charging_bay_number, bay_type) VALUES
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        1,
        (SELECT bay_type_id FROM bay_types WHERE bay_type_name = 'USB-C')
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        2,
        (SELECT bay_type_id FROM bay_types WHERE bay_type_name = 'USB-C')
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        3,
        (SELECT bay_type_id FROM bay_types WHERE bay_type_name = 'Lightning')
    );

INSERT INTO opening_times (charging_point_id, day_of_week, opening_time, closing_time) VALUES
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        'Monday',
        '08:00:00',
        '20:00:00'
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        'Tuesday',
        '08:00:00',
        '20:00:00'
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        'Wednesday',
        '08:00:00',
        '20:00:00'
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        'Thursday',
        '08:00:00',
        '20:00:00'
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        'Friday',
        '08:00:00',
        '20:00:00'
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        'Saturday',
        '10:00:00',
        '18:00:00'
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'WESTGATE'),
        'Sunday',
        '10:00:00',
        '18:00:00'
    );

