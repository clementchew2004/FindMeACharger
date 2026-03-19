import { Request, Response } from "express";
import { pool } from "../lib/db";
import { AsyncResource } from "node:async_hooks";

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
            status: overallStatus,
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
                shorthand_name
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
        charging_point_id,
        owner_id,
        charging_point_location,
        latitude,
        longitude,
        shorthand_name
    } = req.body

    if (!owner_id || !shorthand_name) {
        res.status(400).json({error: "owner_id and shorthand_name are required"});
    }

    try {
        const result = await pool.query (
        `INSERT INTO charging_points(
            owner_id,
            charging_point_location,
            latitude,
            longitude,
            shorthand_name
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [
            owner_id,
            charging_point_location || null,
            latitude || null,
            longitude || null,
            shorthand_name
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
        charging_point_location,
        latitude,
        longitude,
        shorthand_name
    } = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE charging_points 
            SET
                charging_point_location = COALESCE($1, charging_point_location),
                latitude = COALESCE($2, latitude),
                longitude = COALESCE($3, longitude),
                shorthand_name = COALESCE($4, shorthand_name)
            WHERE charging_point_id = $5
            RETURNING *
            `,
            [ 
                charging_point_location,
                latitude,
                longitude,
                shorthand_name,
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
