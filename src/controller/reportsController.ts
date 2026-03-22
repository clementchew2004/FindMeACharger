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
        reporter_id,
        charging_point_id,
        report_reason,
        report_description,
        booking_id 
    } = req.body;

    if(!reporter_id || !charging_point_id || !report_reason) {
        return res.status(400).json({
            error: "reported_id, charging_point_id, report_reason are required to make a report"
        });
    }

    try {
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