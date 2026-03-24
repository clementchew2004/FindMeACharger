INSERT INTO "user"
    (name, email, "emailVerified", public_name, "createdAt", "updatedAt")
VALUES
    ('testoperator123', 'operator@test.com', 'f', 'TestOperator123', NOW(), NOW()),
    ('testcustomer123', 'customer@test.com', 'f', 'TestCustomer123', NOW(), NOW())
    ;

INSERT INTO account
    ("userId", "accountId", "providerId", password, "createdAt", "updatedAt")
VALUES
    (
        (SELECT id FROM "user" WHERE email = 'operator@test.com'),
        (SELECT id FROM "user" WHERE email = 'operator@test.com'),
        'credential',
        'cf22b4c368bd2838b8d70f2db1af90cf:10e62bea6c1e9ad89742e52f5876a7dd32b1523144fb60b6545f45b6ef2b3c58f176747985671878ac93b5635a70604d0fb002227b7ebd0c5c09ed4d2e3caadd',
        NOW(),
        NOW()
    ),
    (
        (SELECT id FROM "user" WHERE email = 'customer@test.com'),
        (SELECT id FROM "user" WHERE email = 'customer@test.com'),
        'credential',
        'b9f608a46984b709083c5d34d9843b6b:d5f53305f81d7dd4fc2482a6ac981bacd8513bbeededfc6577f078b11aaa1f8b0bbb2dfb59d2713e792c7a5e23b8dd094d3d194afa939efc85609b7249aea2f4',
        NOW(),
        NOW()
    )
    ;

INSERT INTO operators
    (user_id, organisation_id)
VALUES
(
    (SELECT id FROM "user" WHERE email = 'operator@test.com'),
    (SELECT organisation_id FROM organisations WHERE organisation_name = 'Supaspeed123 Ltd.')
);

INSERT INTO customers
    (user_id)
VALUES
(
    (SELECT id FROM "user" WHERE email = 'customer@test.com')
);

