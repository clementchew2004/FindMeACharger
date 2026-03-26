import t from "tap"
import { Request, Response } from "express";
import {getUserProfile, updateUserProfile, getCurrentUser} from "../src/controller/userController";
import {pool} from "../src/lib/db";

t.test('test users', async t => {
    await pool.query(
        `
        INSERT INTO "user" (name, public_name, email) VALUES
        ($1, $2, $3);
        `,
        ['unit_test_person', 'Unit', 'test@test.test']
    );
    await pool.query(
        `
        INSERT INTO "user" (name, public_name, email) VALUES
        ($1, $2, $3);
        `,
        ['unit_test_person2', 'Unit2', 'test2@test.test']
    );
    try {
        const testUser = await pool.query(
        `
            SELECT id FROM "user" WHERE email=$1;
        `,
        ['test@test.test']
        );

        if (!testUser) throw new Error("no test user");

        const request = {
            user: {
                id: testUser.rows[0].id
            }
        } as unknown as Request;

        var respStatus = 200;
        var output : any = null;
        const response = {
            body: {}, 
            status: (s : any) => {
                respStatus = s;
                return response;
            },
            json: (b : any) => {
                output = b;
                return response;
            }
        } as unknown as Response;
        await getUserProfile(request, response);
        t.equal(respStatus, 200);
        t.match(output, {
            name: 'unit_test_person',
            public_name: 'Unit',
            email: 'test@test.test'
        });

        (request as any).user.id = -1;
        output = {};
        respStatus = 200;
        await getUserProfile(request, response);
        t.equal(respStatus, 404);

        (request as any).user = null;
        output = {};
        respStatus = 200;
        await getUserProfile(request, response);
        t.equal(respStatus, 401);

        (request as any).user = {
            id: "cheese"
        };
        output = {};
        respStatus = 200;
        await getUserProfile(request, response);
        t.equal(respStatus, 500);

        (request as any).user.id = testUser.rows[0].id;
        (request as any).body = {
            name: "success",
            public_name: "success"
        };
        output = {};
        respStatus = 200;
        await updateUserProfile(request, response);
        t.equal(respStatus, 200);
        t.match(output, {
            name: "success",
            email: "test@test.test",
            public_name: "success"
        });

        const testUser2 = await pool.query(
        `
            SELECT id FROM "user" WHERE email=$1;
        `,
        ['test2@test.test']
        );
        (request as any).user.id = testUser2.rows[0].id;
        (request as any).body = {
            name: "success",
            public_name: "success"
        };
        output = {};
        respStatus = 200;
        await updateUserProfile(request, response);
        t.equal(respStatus, 400);
        t.match(output, {
            error: "Username is already taken"
        });

        (request as any).user.id = undefined;
        (request as any).body = {
            name: "success",
            public_name: "success"
        };
        output = {};
        respStatus = 200;
        await updateUserProfile(request, response);
        t.equal(respStatus, 401);

        (request as any).user.id = testUser.rows[0].id;
        (request as any).body = {
            public_name: "success"
        };
        output = {};
        respStatus = 200;
        await updateUserProfile(request, response);
        t.equal(respStatus, 400);
        t.match(output, {
            error: "Username is required"
        });

        (request as any).user.id = -1;
        (request as any).body = {
            name: "success",
            public_name: "success"
        };
        output = {};
        respStatus = 200;
        await updateUserProfile(request, response);
        t.equal(respStatus, 404);

        (request as any).user.id = "cheese";
        (request as any).body = {
            name: "success"
        };
        output = {};
        respStatus = 200;
        await updateUserProfile(request, response);
        t.equal(respStatus, 500);
    }
    catch (e) {
        console.error(e);
        t.bail = true;
        t.fail("error occurred getting testUser row");
    }
    finally {
        await pool.query(
            `
                DELETE FROM
                    "user"
                WHERE
                    email = $1
            `,
            ['test@test.test']
        );
        await pool.query(
            `
                DELETE FROM
                    "user"
                WHERE
                    email = $1
            `,
            ['test2@test.test']
        );
    }
    

    
});

t.test('test operator user', async t => {
    var user = null;
    var operator = null;
    try {
        user = await pool.query(
            `INSERT INTO 
                "user" (name, email)
            VALUES
                ($1, $2)
            RETURNING "user".id;
            `,
            ["Test Operator", "optestnew@test.com"]
        );
        if (!user) throw new Error("couldn't make user");

        const request = {
            user: {
                //id: user.rows[0].id
            }
        } as unknown as Request;

        var respStatus = 200;
        var output : any = null;
        const response = {
            status: (s : any) => {
                respStatus = s;
                return response;
            },
            json: (b : any) => {
                output = b;
                return response;
            }
        } as unknown as Response;

        await getCurrentUser(request, response);
        t.equal(respStatus, 401);
        t.match(output, {
            error: "Not authenticated"
        });

        (request as any).user.id = "cheese";
        await getCurrentUser(request, response);
        t.equal(respStatus, 500);
        t.match(output, {
            error: "Server error"
        });

        (request as any).user.id = user.rows[0].id;
        respStatus = 200;
        await getCurrentUser(request, response);
        t.equal(respStatus, 200);
        t.match(output, {
            isOperator: false
        });


        operator = await pool.query(
            `
            INSERT INTO
                operators (user_id, organisation_id)
            VALUES
                ($1, (SELECT organisation_id FROM organisations WHERE organisation_name = $2))
            RETURNING
                operators.operator_id;
            `,
            [user.rows[0].id, 'Supaspeed123 Ltd.']
        );
        if (!operator) throw new Error("couldn't make operator");
        
        (request as any).user.id = user.rows[0].id;
        respStatus = 200;
        await getCurrentUser(request, response);
        t.equal(respStatus, 200);
        t.match(output, {
            isOperator: true
        });
    }
    catch (error) {
        console.error(error);
        t.fail("test operator user caught an error");
    }
    finally {
        if (user) {
            if (operator) {
                await pool.query(
                    `
                    DELETE FROM
                        operators
                    WHERE
                        operators.user_id = $1
                    `,
                    [user.rows[0].id]
                );
            }

            await pool.query(
                `
                DELETE FROM 
                    "user"
                WHERE
                    "user".name = $1;
                `,
                ["Test Operator"]
            );
        }
    }
});



