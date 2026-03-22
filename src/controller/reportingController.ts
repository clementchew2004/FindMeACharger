import { Request, Response } from "express";
import { pool } from "../lib/db";

export const getReportTypes = async (req: Request, res: Response) => {
    try {
        const query = await pool.query(
            `
            SELECT
                report_types.report_reason
            FROM report_types;
            `
        );
        if (!query || query.rows.length === 0) {
            res.status(204).json({ error: "No report types found" });
            return;
        }

        res.status(200).json({ reportTypes: query.rows.map(row => row.report_reason) });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to fetch report types"})
    }
}