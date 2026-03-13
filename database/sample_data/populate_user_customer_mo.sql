INSERT INTO users (name, public_name, email) VALUES
('mo_mo123', 'Mo', 'mo@example.com');

INSERT INTO customers (user_id) VALUES
((SELECT id FROM users WHERE name = 'mo_mo123'));

INSERT INTO bookings (customer_id, charging_bay_id, start_time, end_time) VALUES
(
    (SELECT customer_id FROM customers WHERE user_id = (SELECT id FROM users WHERE name = 'mo_mo123')),
    (SELECT charging_bay_id FROM charging_bays WHERE charging_point_id = (SELECT charging_point_id FROM charging_points WHERE charging_point_location = 'Westgate, Birmingham, B15 2GB') AND charging_bay_number = 1),
    '2026-01-10 08:00:00+00',
    '2026-01-10 13:00:00+00'
);

INSERT INTO bookings (customer_id, charging_bay_id, start_time, end_time) VALUES
(
    (SELECT customer_id FROM customers WHERE user_id = (SELECT id FROM users WHERE name = 'mo_mo123')),
    (SELECT charging_bay_id FROM charging_bays WHERE charging_point_id = (SELECT charging_point_id FROM charging_points WHERE charging_point_location = 'Westgate, Birmingham, B15 2GB') AND charging_bay_number = 1),
    '2026-05-10 10:00:00+00',
    '2026-05-10 12:00:00+00'
);
INSERT INTO bookings (customer_id, charging_bay_id, start_time, end_time) VALUES
(
    (SELECT customer_id FROM customers WHERE user_id = (SELECT id FROM users WHERE name = 'mo_mo123')),
    (SELECT charging_bay_id FROM charging_bays WHERE charging_point_id = (SELECT charging_point_id FROM charging_points WHERE charging_point_location = 'Westgate, Birmingham, B15 2GB') AND charging_bay_number = 2),
    '2026-05-10 10:00:00+00',
    '2026-05-10 12:00:00+00'
);
INSERT INTO bookings (customer_id, charging_bay_id, start_time, end_time) VALUES
(
    (SELECT customer_id FROM customers WHERE user_id = (SELECT id FROM users WHERE name = 'mo_mo123')),
    (SELECT charging_bay_id FROM charging_bays WHERE charging_point_id = (SELECT charging_point_id FROM charging_points WHERE charging_point_location = 'Westgate, Birmingham, B15 2GB') AND charging_bay_number = 1),
    '2026-05-11 10:00:00+00',
    '2026-05-11 12:00:00+00'
);


