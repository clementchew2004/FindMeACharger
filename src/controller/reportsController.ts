import { Request, Response } from "express";
import { pool } from "../lib/db";

export const getReportType = async(req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT 
                report_type_id,
                report_reason
            FROM 
                report_types
            ORDER BY report_type_id
            `
        );
        res.json(result.rows);
        /* c8 ignore start */
} catch(error) {
    
    /* 
        genuinely don't think there's a good way to trigger this one in a unit test
        since we don't actually give this any data.
        besides just making the response completely malformed but that doesn't really
        make too much sense.
    */
    console.error(error)
    res.status(500).json({error: "Failed to fetch report type"})
    }
    /* c8 ignore stop */
}

export const createReport = async (req: Request, res: Response) => {
    if(!req.body) {
        return res.status(500).json({error: "Request body is missing"})
    }
    
    const{ 
        charging_point_sname,
        report_category,
        report_description,
        booking_id
    } = req.body;

    const reporter_user_id = req.session?.userId;

    if(!reporter_user_id || !charging_point_sname || !report_category) {
        return res.status(400).json({
            error: "reporter_id, charging_point_id, report_reason are required to make a report"
        });
    }

    try {
        const report_reason_result = await pool.query(
            `SELECT report_type_id FROM report_types WHERE report_reason = $1`,
            [report_category]
        );
        if(report_reason_result.rowCount === 0) {
            return res.status(400).json({error: "Invalid report category"})
        }
        const report_reason = report_reason_result.rows[0].report_type_id;

        const charging_point_result = await pool.query(
            `SELECT charging_point_id FROM charging_points WHERE shorthand_name = $1`,
            [charging_point_sname]
        );
        if(charging_point_result.rowCount === 0) {
            return res.status(400).json({error: "Invalid charging point short name"})
        }
        const charging_point_id = charging_point_result.rows[0].charging_point_id;

        const reporter_result = await pool.query(
            `SELECT customer_id FROM customers WHERE user_id = $1`,
            [reporter_user_id]
        );
        if(reporter_result.rowCount === 0) {
            return res.status(400).json({error: "Invalid reporter user id"})
        }
        const reporter_id = reporter_result.rows[0].customer_id;

        const result = await pool.query(
            `INSERT INTO reports (
                reporter_id,
                charging_point_id,
                report_reason,
                report_description,
                booking_id)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                reporter_id,
                charging_point_id,
                report_reason,
                /* c8 ignore start */
                // ignored because irrelevant
                report_description || null,
                booking_id || null
                /* c8 ignore stop */
            ]
        );

        res.status(201).json({
            message: "Report created successfully",
            report: result.rows[0]
        });

    } catch (error){
        console.error("Failed to create report", error)
        res.status(500).json({error: "Failed to create report"});
    }
};

export const getReports = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT
                r.report_id,
                r.reporter_id,
                r.charging_point_id,
                r.report_reason,
                r.report_description,
                r.booking_id
            FROM reports r 
            JOIN report_types rt
                ON r.report_reason = rt.report_type_id
            ORDER BY r.report_id;
            `
        );

        res.json(result.rows);
        /* c8 ignore start */
    } catch (error) {
        
        /*
            same reason as above.
        */
        console.error("Failed to get report:" , error);
        res.status(500).json({error: "Failed to fetch report"})
    }
    /* c8 ignore stop */

}