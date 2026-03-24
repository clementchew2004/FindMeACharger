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
                point.charging_point_location,
                point.cost_per_kwh
            FROM 
                charging_points point
            WHERE 
                point.is_operational = trues
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

export const filterChargingPoints = async (req: Request, res: Response) => {
    const {
        longitude,
        latitude,
        maxDistance,
        availability,
        wheelchair_accessible,
        blocked_socket,
        bay_type,
        cost
    } = req.query;

    const hasAnyDistanceParam = longitude !== undefined || latitude !== undefined || maxDistance !==undefined;

    if(hasAnyDistanceParam) {
        if(longitude === undefined || latitude === undefined || maxDistance === undefined) {
            return res.status(400).json({
                error: "latitude, longitude and maxDistance must all be provided"
            });
        }
    }

    let parsedLatitude: number | null = null;
    let parsedLongitude: number | null = null;
    let parsedMaxDistance: number | null = null;

    if (hasAnyDistanceParam) {
        parsedLatitude = Number(latitude);
        parsedLongitude = Number(longitude);
        parsedMaxDistance = Number(maxDistance);

        if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude) || Number.isNaN(parsedMaxDistance)) {
            return res.status(400).json({
                error: "latitude, longitude and maxDistance must be valid numbers"
            });
        }
    }

    if (availability !== undefined && availability !== "available" && availability !== "busy") {
        return res.status(400).json({
            error: "availability must be either 'available' or 'busy'"
        });
    }

    if (wheelchair_accessible !== undefined && wheelchair_accessible !== "true" && wheelchair_accessible !== "false") {
        return res.status(400).json({
            error: "wheelchair_accessible must be 'true' or 'false' "
        });
    }

    if(blocked_socket !== undefined && blocked_socket !== "true" && blocked_socket !== "false") {
        return res.status(400).json({
            error: "blocked_socket must be 'true' or 'false' "
        });
    }

     if (cost !== undefined && cost !== "free" && cost !== "paid") {
        return res.status(400).json({error: "cost must be either 'free' or 'paid'"});
    }

    let parsedBayTypeId: number | null = null;
    let parsedBayTypeName: string | null = null;
    
    if(bay_type !== undefined) {
        const bayTypeAsNumber = Number(bay_type);

        if(!Number.isNaN(bayTypeAsNumber)) {
            parsedBayTypeId = bayTypeAsNumber; 
        } else {
            parsedBayTypeName = String(bay_type).trim();
            
            if (!parsedBayTypeName) {
                return res.status(400).json({
                    error: "bay_type must not be empty"
                })
            }
        }
    }

    const queryParams: any[] = [];
    const whereConditions: string[] = [];

    whereConditions.push(`point.is_operational = true`);

    const availabilityFormula = `
        CASE
            WHEN EXISTS (
                SELECT 1 
                FROM bookings b
                WHERE b.charging_bay_id = cb.charging_bay_id
                    AND NOW() BETWEEN b.start_time AND b.end_time
            ) THEN 'busy' 
            ELSE 'available' 
        END
    `;

    let distanceSelect = `NULL::float AS distance`;

    if(hasAnyDistanceParam) {
        queryParams.push(parsedLatitude, parsedLongitude, parsedMaxDistance);

        distanceSelect = `
            (
                6371 * acos(
                    cos(radians($1)) * cos(radians(point.latitude)) * cos(radians(point.longitude) - radians($2)) +
                    sin(radians($1)) * sin(radians(point.latitude))
                )
            ) AS distance
        `;

        whereConditions.push(`
            (
                6371 * acos(
                    cos(radians($1)) * cos(radians(point.latitude)) * cos(radians(point.longitude) - radians($2)) +
                    sin(radians($1)) * sin(radians(point.latitude))
                )
            ) <= $3
        `);
    }

    if(availability !== undefined) {
        queryParams.push(availability);

    whereConditions.push(`${availabilityFormula} = $${queryParams.length}`);
    }

    if (wheelchair_accessible !== undefined) {
        queryParams.push(wheelchair_accessible === "true");
        whereConditions.push(`cb.wheelchair_accessible = $${queryParams.length}`);
    }

    if (blocked_socket !== undefined) {
        queryParams.push(blocked_socket === "true");
        whereConditions.push(`cb.blocked_socket = $${queryParams.length}`);
    }

    if (parsedBayTypeId !== null) {
        queryParams.push(parsedBayTypeId);
        whereConditions.push(`cb.bay_type = $${queryParams.length}`);
    }

    if (parsedBayTypeName !== null) {
        queryParams.push(parsedBayTypeName);
        whereConditions.push(`bt.bay_type_name = $${queryParams.length}`);
    }

    if(cost !== undefined) {
        if(cost === "free") {
            whereConditions.push(`COALESCE(point.cost_per_kwh, 0) = 0`);
        }

        if(cost === "paid") {
            whereConditions.push(`COALESCE(point.cost_per_kwh, 0) >0 `);
        }
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const orderClause = hasAnyDistanceParam
        ? `ORDER BY distance ASC, point.charging_point_id ASC, cb.charging_bay_number ASC`
        : `ORDER BY point.charging_point_id ASC, cb.charging_bay_number ASC`;

    try {
        const result = await pool.query(
            `
            SELECT
                point.charging_point_id,
                point.shorthand_name,
                point.charging_point_location,
                point.latitude,
                point.longitude,
                point.cost_per_kwh,
                ${distanceSelect},
                cb.charging_bay_id,
                cb.charging_bay_number,
                cb.bay_type,
                bt.bay_type_name,
                cb.is_operational,
                cb.wheelchair_accessible,
                cb.blocked_socket,
                cb.accessibility_notes,
                ${availabilityFormula} AS status
            FROM charging_points point
            JOIN charging_bays cb
                ON cb.charging_point_id = point.charging_point_id
            JOIN bay_types bt
                ON cb.bay_type = bt.bay_type_id
            ${whereClause}
            ${orderClause};
            `,
            queryParams
        );

        if (result.rows.length === 0) {
            return res.status(200).json([]);
        }

        const groupedResults = result.rows.reduce((acc: any[], row: any) => {
            let chargingPoint = acc.find(
                (item) => item.chargingPointId === row.charging_point_id
            );

            if (!chargingPoint) {
                chargingPoint = {
                    chargingPointId: row.charging_point_id,
                    shorthand_name: row.shorthand_name,
                    charging_point_location: row.charging_point_location,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    cost_per_kwh: row.cost_per_kwh,
                    distance: row.distance !== null ? Number(row.distance) : null,
                    bays: []
                };
                acc.push(chargingPoint);
            }

            chargingPoint.bays.push({
                charging_bay_id: row.charging_bay_id,
                charging_bay_number: row.charging_bay_number,
                bay_type: row.bay_type,
                bay_type_name: row.bay_type_name,
                is_operational: row.is_operational,
                wheelchair_accessible: row.wheelchair_accessible,
                blocked_socket: row.blocked_socket,
                accessibility_notes: row.accessibility_notes,
                status: row.status
            });

            return acc;
        }, []);

        res.status(200).json(groupedResults);
    } catch (error) {
        console.error("Filter charging points error:", error);
        res.status(500).json({ error: "Failed to filter charging points" });
    }
};

export const getBayTypes = async (req: Request, res: Response) => { 
    try {
        const result = await pool.query(`
            SELECT 
                bay_type_id,
                bay_type_name
            FROM bay_types 
            ORDER BY bay_type_id;
            `
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to fetch bay types "});
    }

}

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
