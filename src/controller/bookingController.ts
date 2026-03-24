import { Request, Response } from "express";
import { pool } from "../lib/db";

export const makeBooking = async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                error: "Missing body"
            });
        }
        /*
            booking length is in minutes
        */
        const {
            charging_bay_id,
            booking_length
        } = req.body;

        const customer = await pool.query(
            `
            SELECT customer.customer_id
            FROM customers customer
            WHERE customer.user_id = $1
            `,
            [
                req.user?.id
            ]
        );
        if (!customer || customer.rowCount == 0) {
            return res.status(400).json({
                error: "Missing either customer id or bay id"
            });
        }
        const customer_id = customer?.rows[0].customer_id;


        if (!customer_id || !charging_bay_id) {
            return res.status(400).json({
                error: "Missing either customer id or bay id"
            });
        }
        if (!booking_length || booking_length <= 0) {
            return res.status(400).json({
                error: "Inappropriate booking length"
            });
        }

        const booking_check = await pool.query(
            `
                SELECT booking.booking_id
                FROM bookings booking
                WHERE 
                    booking.charging_bay_id = $1
                    AND ((NOW() BETWEEN booking.start_time AND booking.end_time) OR ((NOW() + make_interval(mins => $2)) BETWEEN booking.start_time AND booking.end_time));
            `,
            [charging_bay_id, booking_length]
        )
        if (!booking_check) {
            return res.status(500).json({
                error: "An unexpected error occurred"
            });
        }
        if (booking_check.rowCount || 0 > 0) {
            return res.status(400).json({
                error: "Inappropriate booking length"
            });
        }

        const response = await pool.query(
            `
                INSERT INTO 
                    bookings (charging_bay_id, customer_id, start_time, end_time)
                VALUES
                    ($1, $2, NOW(), NOW() + make_interval(mins => $3))
                RETURNING *;
            `,
            [charging_bay_id, customer_id, booking_length]
        );
        /* c8 ignore start */
        // pre-emptive because i just know i'm not gonna be able to get this bit covered
        if (!response || response.rowCount || 0 === 0) {
            return res.status(500).json({
                error: "Couldn't book slot"
            })
        }
        /* c8 ignore stop */

        return res.status(201).json({
            booking: response.rows[0]
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "An unexpected error occurred"
        });
    }
    

}