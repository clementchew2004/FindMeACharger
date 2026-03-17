INSERT INTO "user" (name, public_name, email) VALUES
('laylah_supaspeed123', 'Layla Hertford', 'laylah@supaspeed123.co.uk');

INSERT INTO organisations (organisation_name) VALUES
('Supaspeed123 Ltd.');

INSERT INTO operators (user_id, organisation_id) VALUES
    (
        (SELECT id FROM "user" WHERE name = 'laylah_supaspeed123'),
        (SELECT organisation_id FROM organisations WHERE organisation_name = 'Supaspeed123 Ltd.')
    );

UPDATE 
    organisations 
SET
    organisation_owner_id = (
        SELECT
            operator_id
        FROM
            operators
        WHERE
            user_id = (SELECT id FROM "user" WHERE name = 'laylah_supaspeed123')
    )
WHERE
    organisation_name = 'Supaspeed123 Ltd.';