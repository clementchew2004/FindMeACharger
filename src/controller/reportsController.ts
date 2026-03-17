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

} catch(error) {
    console.error(error)
    res.status(500).json({error: "Failed to fetch report type"})
    }
}

export const createReport = async (req: Request, res: Response) => {
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
                report_description || null,
                booking_id || null
            ]
        );

        res.status(201).json({
            message: "Report created succesfully",
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

    } catch (error) {
        console.error("Failed to get report:" , error);
        res.status(500).json({error: "Failed to fetch report"})
    }
}