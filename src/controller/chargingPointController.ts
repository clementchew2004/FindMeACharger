import { Request, Response } from "express";
import { pool } from "../lib/db";

// Feature F5
export const getChargingPointStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `
             SELECT
                cb.charging_bay_id,
                cb.charging_bay_number, 
                bt.bay_type_name, 
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM bookings b
                        WHERE b.charging_bay_id = cb.charging_bay_id
                            AND NOW() BETWEEN b.start_time AND b.end_time
                    ) THEN 'busy'
                     ELSE 'available'
                END AS status
            FROM charging_bays cb 
            JOIN bay_types bt 
                ON cb.bay_type = bt.bay_type_id
            WHERE cb.charging_point_id = $1
            ORDER BY cb.charging_bay_number;
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Charging point not found"});
        }

        const overallStatus = result.rows.every((bay) => bay.status === "busy")
        ? "busy" : "available";

        res.json({
            chargingPointId: id,
            overallStatus,
            bays: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to fetch status"})
    }
}

// Feature F9 
export const getChargingPointAccessiblity = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `
            SELECT
                cb.charging_bay_id,
                cb.charging_bay_number,
                bt.bay_type_name,
                cb.is_operational,
                cb.wheelchair_accessible,
                cb.blocked_socket,
                cb.accessibility_notes
            FROM charging_bays cb
            JOIN bay_types bt 
                ON cb.bay_type = bt.bay_type_id
            WHERE cb.charging_point_id = $1
            ORDER BY cb.charging_bay_number;
            `,
            [id]
        );

        if(result.rows.length === 0) {
            return res.status(404).json({error: "Charging point not found"});
        }

        res.json({
            chargingPointId: id,
            bays: result.rows,
        });
    } catch (error) {
        console.error("F9 accessibility data:", error);
        res.status(500).json({error: "Failed to fetch accessibility data"});
    }
};
   

