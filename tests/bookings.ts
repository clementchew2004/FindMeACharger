import t from "tap"
import { Request, Response } from "express";
import {pool} from "../src/lib/db";
import { makeBooking } from "../src/controller/bookingController";

t.test('test bookings', async t => {
    const request = {

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

    await makeBooking(request, response);
    t.equal(respStatus, 400);
    t.match(output, {
        error: "Missing body"
    });

    try {
        const r = await pool.query(
            `
            INSERT INTO "user" (name, public_name, email) 
            VALUES
                ($1, $2, $3)
            RETURNING *;
            `,
            ['unit_test_person3', 'Unit3', 'test3@test.test']
        );
        if (!r) throw new Error("user creation failed");
        (request as any).user = {
            id: r.rows[0].id
        };
        (request as any).body = {

        };
        respStatus = 200;
        await makeBooking(request, response);
        t.equal(respStatus, 400);
        t.match(output, {
            error: "Missing either customer id or bay id"
        });
        try {
            const customer = await pool.query(
                `
                INSERT INTO customers
                    (user_id)
                VALUES
                    ($1);
                `,
                [r.rows[0].id]
            );
            if (!customer) throw new Error("dont work");

            respStatus = 200;
            await makeBooking(request, response);
            t.equal(respStatus, 400);
            t.match(output, {
                error: "Missing either customer id or bay id"
            });

            respStatus = 200;
            (request as any).body.charging_bay_id = -1;
            await makeBooking(request, response);
            t.equal(respStatus, 400);
            t.match(output, {
                error: "Inappropriate booking length"
            });

            respStatus = 200;
            (request as any).body.charging_bay_id = -1;
            (request as any).body.booking_length = -10;
            await makeBooking(request, response);
            t.equal(respStatus, 400);
            t.match(output, {
                error: "Inappropriate booking length"
            });

            respStatus = 200;
            (request as any).body.charging_bay_id = -1;
            (request as any).body.booking_length = 60;
            await makeBooking(request, response);
            t.equal(respStatus, 500);
            t.match(output, {
                error: "An unexpected error occurred"
            });

            const bay = await pool.query(
                `
                SELECT 
                    bay.charging_bay_id
                FROM charging_bays bay;
                `
            );
            if (!bay) throw new Error("no bay");

            const bid = bay.rows[0].charging_bay_id;
            respStatus = 200;
            (request as any).body.charging_bay_id = bid;
            (request as any).body.booking_length = 60;
            await makeBooking(request, response);
            t.equal(respStatus, 201);
            t.match(output, {
                error: undefined
            });
            respStatus = 200;
            (request as any).body.charging_bay_id = bid;
            (request as any).body.booking_length = 60;
            await makeBooking(request, response);
            t.equal(respStatus, 500);
            t.match(output, {
                error: "An unexpected error occurred"
            });

        } finally {
            await pool.query(
                `
                DELETE FROM 
                    bookings 
                WHERE 
                    customer_id = (SELECT customer_id FROM customers WHERE user_id = $1);
                `,
                [r.rows[0].id]
            );
            await pool.query(
                `
                    DELETE FROM
                        customers
                    WHERE
                        user_id = $1;
                `,
                [r.rows[0].id]
            );

        }
    }
    catch (error)
    {
        console.error(error);
    }
    finally {
        await pool.query(
            `
                DELETE FROM
                    "user"
                WHERE
                    email = $1
            `,
            ['test3@test.test']
        );
    }
    
});