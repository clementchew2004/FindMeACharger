import { Request, Response } from "express";
import { pool } from "../lib/db";

export const getChargingPointIdFromShorthand = async (shorthand : any) => {
    const result = await pool.query(
        `
            SELECT
                point.charging_point_id
            FROM charging_points point
            WHERE point.shorthand_name = $1;
        `,
        [shorthand]
    );
    return result.rows[0];
}

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

        /* c8 ignore start */
        const overallStatus = result.rows.every((bay) => bay.status === "busy")
        ? "busy" : "available";
        /* c8 ignore stop */

        res.json({
            chargingPointId: id,
            status: overallStatus,
            bays: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to fetch status"})
    }
}

// Feature F9 
export const getChargingPointAccessibility = async (req: Request, res: Response) => {
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
   
/*
returns all charging points within a specified maximum distance (in km)
from a provided longitude and latitude (presumably the user's location)
uses a simpler distance formula just to filter out extreme, obviously unimportant charging points.
once we've got the map/routing stuff on main, probably a good idea to prompt the routing api for accurate distance/time metrics.

*/
export const getChargingPointsWithinDistance = async (req: Request, res: Response) => {
    const {longitude, latitude, maxDistance} = req.query;
    if (!longitude || !latitude || !maxDistance) {
        return res.status(400).json({error: "Missing required query parameters: longitude, latitude, maxDistance"});
    }
    try {
        // distance formula came from https://alikhallad.com/how-to-find-closest-locations-using-coordinates-with-sql/
        // adjusted to use kilometers, as that's more common globally.
        const result = await pool.query(
            `
            SELECT 
                point.charging_point_id,
                (
                    6371 * acos(
                        cos(radians($1)) * cos(radians(point.latitude)) * cos(radians(point.longitude) - radians($2)) +
                        sin(radians($1)) * sin(radians(point.latitude))
                    )
                ) AS distance,
                point.latitude,
                point.longitude,
                point.shorthand_name,
                point.charging_point_location
            FROM 
                charging_points point
            WHERE 
                (
                    6371 * acos(
                        cos(radians($1)) * cos(radians(point.latitude)) * cos(radians(point.longitude) - radians($2)) +
                        sin(radians($1)) * sin(radians(point.latitude))
                    )
                ) <= $3
            ORDER BY 
                distance ASC;
            `,
            [latitude, longitude, maxDistance]
        );
        
        if (result.rows.length === 0) {
            // i wasn't totally sure if it should be 200, 204 or 404, but i think 204 makes the most sense, since
            // there being no results isn't strictly an error. -carter
            return res.status(204).json({error: "No charging points found within the specified distance" });
        }
        
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to fetch charging points"});
    }
}

// Charging Point Management F16
export const getAllChargingPoints = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT
                charging_point_id,
                owner_id,
                charging_point_location,
                latitude,
                longitude,
                shorthand_name, 
                charging_point_name,
                cost_per_kwh,
                is_operational,
                accessibility_features
            FROM 
                charging_points 
            ORDER BY charging_point_id
            `
        )

        if (result.rows.length === 0 ) {
             return res.status(404).json({error: "No charging points found"})
        }

        res.json(result.rows);

    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Failed to fetch all charging points'})
    }
}

export const createChargingPoint = async(req: Request, res: Response) => {
    const {
        charging_point_name,
        owner_id,
        charging_point_location,
        latitude,
        longitude,
        shorthand_name,
        cost_per_kwh,
        is_operational,
        accessibility_features
    } = req.body

    if (!owner_id || !shorthand_name || !charging_point_name) {
        res.status(400).json({error: "owner_id, shorthand_name and charging_point_name are required"});
    }

    try {
        const result = await pool.query (
        `INSERT INTO charging_points(
            owner_id,
            charging_point_name,
            charging_point_location,
            latitude,
            longitude,
            shorthand_name,
            cost_per_kwh,
            is_operational,
            accessibility_features
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
        `,
        [
            owner_id,
            charging_point_name,
            charging_point_location || null,
            latitude || null,
            longitude || null,
            shorthand_name,
            cost_per_kwh ?? null,
            is_operational ?? true,
            accessibility_features || []
        ]
    );

    res.status(201).json({
        messaege: "Charging Point created successfully",
        chargingPoint: result.rows[0]
    });
   
 } catch (error: any) {
    console.error(error);

    if (error.code === "23505") {
        return res.status(400).json({
            error: "shorthand_name must be unique"
        });
    }

    res.status(500).json('Faile to create charging point')
    }
};

export const updateChargingPoint = async (req: Request, res: Response) => {
    const {id} = req.params;

    const {
        charging_point_name,
        charging_point_location,
        latitude,
        longitude,
        shorthand_name,
        cost_per_kwh,
        is_operational,
        accessibility_features
    } = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE charging_points 
            SET
                charging_point_name = COALESCE($1, charging_point_name),
                charging_point_location = COALESCE($2, charging_point_location),
                latitude = COALESCE($3, latitude),
                longitude = COALESCE($4, longitude),
                shorthand_name = COALESCE($5, shorthand_name),
                cost_per_kwh = COALESCE($6, cost_per_kwh),
                is_operational = COALESCE($7, is_operational),
                accessibility_features = COALESCE($8, accessibility_features)
            WHERE charging_point_id = $9
            RETURNING *
            `,
            [ 
                charging_point_name,
                charging_point_location,
                latitude,
                longitude,
                shorthand_name,
                cost_per_kwh,
                is_operational,
                accessibility_features,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Charging Point not found"});
        }

        res.json({
            message: "Charging point updated succesfully",
            chargingPoint: result.rows[0]
        });

    } catch (error: any) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(400).json({
                error: "shorthand_name must be unique"
            });
        }
        res.status(500).json({error: "Failed to update charging point"});
    }
}

export const deleteChargingPoint = async (req: Request, res: Response) => {
    const {id} = req.params;

    try {
        const result = await pool.query(
            `
            DELETE FROM charging_points 
            WHERE 
                charging_point_id =$1 
                RETURNING *;
                `,
                [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Charging Point not found"});
        }

        res.json({
            message: "Charging point deleted succesfully",
            chargingPoint: result.rows[0]
        });

    } catch (error: any) {
        console.error(error);

        if (error.code === "23503") {
            return res.status(400).json({
                error: "Cannot delete charging point because related record exist"
            });
        }
        res.status(500).json({error: "Failed to delete charging point"});
    }
}

export const getChargingBaysByChargingPoint = async(req:Request, res: Response) => {
    console.log("BAYS Route HIT");
    const {id} = req.params;

    try{ 
        const result = await pool.query(
            `
            SELECT 
                cb.charging_bay_id,
                cb.charging_point_id,
                cb.charging_bay_number,
                cb.bay_type,
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

        if (result.rows.length === 0) {
            return res.status(400).json({error: "No charging bays found for this charging point"})
        }

        res.json({
            chargingPointId: id,
            bays: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to fetch charging bays"});
    }
};

export const createChargingBay = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        charging_bay_number,
        bay_type,
        is_operational,
        wheelchair_accessible,
        blocked_socket,
        accessibility_notes
    } = req.body;

    if (!charging_bay_number || !bay_type) {
        return res.status(400).json({
            error: "charging_bay_number and bay type are required"
        });
    }

    try {
        const result = await pool.query(
             `
            INSERT INTO charging_bays (
                charging_point_id,
                charging_bay_number,
                bay_type,
                is_operational,
                wheelchair_accessible,
                blocked_socket,
                accessibility_notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
            `,
            [
                id,
                charging_bay_number,
                bay_type,
                is_operational ?? true, 
                wheelchair_accessible ?? false,
                blocked_socket ?? false,
                accessibility_notes || null
            ]
        );

        res.status(201).json({
            message: "Charging bay created successfully",
            chargingBay: result.rows[0]
        });

    } catch (error: any) {
        console.error(error)
        res.status(500).json({error: "Failed to create charging bay"})

    }
}

export const updateChargingBay = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        charging_bay_number,
        bay_type,
        is_operational,
        wheelchair_accessible,
        blocked_socket,
        accessibility_notes
    } = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE charging_bays
            SET
                charging_bay_number = COALESCE($1, charging_bay_number),
                bay_type = COALESCE($2, bay_type),
                is_operational = COALESCE($3, is_operational),
                wheelchair_accessible = COALESCE($4, wheelchair_accessible),
                blocked_socket = COALESCE($5, blocked_socket),
                accessibility_notes = COALESCE($6, accessibility_notes)
            WHERE charging_bay_id = $7
            RETURNING *;
            `,
            [
                charging_bay_number,
                bay_type,
                is_operational,
                wheelchair_accessible,
                blocked_socket,
                accessibility_notes,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Charging bay not found" });
        }

        res.json({
            message: "Charging bay updated successfully",
            chargingBay: result.rows[0]
        });
    } catch (error) {
        console.error("Update charging bay error:", error);
        res.status(500).json({ error: "Failed to update charging bay" });
    }
};

export const getChargingPointStats = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
               SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE is_operational = true) AS active,
                    COUNT(*) FILTER (WHERE is_operational = false) AS suspended
                FROM charging_points;
            `);

            res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to fetch stats"});
    }
};