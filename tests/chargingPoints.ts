import t from "tap"
import { Request, Response } from "express";
import {pool} from "../src/lib/db";
import { getChargingPointIdFromShorthand, getChargingPointAccessibility, getChargingPointStatus, getChargingPointsWithinDistance, createChargingPoint, updateChargingPoint, getChargingBaysByChargingPoint, createChargingBay, updateChargingBay, getChargingPointStats, deleteChargingPoint} from "../src/controller/chargingPointController";


t.test('test chargingPointStatus', async t => {
    const westgateCid = (await getChargingPointIdFromShorthand("WESTGATE")).charging_point_id;
    const request = {params: {id: westgateCid}} as unknown as Request;
    var respStatus = 200;
    var output : any = null;
    const response = {
        body: {}, 
        status: (s : any) => {
            respStatus = s;
            return response;
        },
        json: (b : any) => {
            output = b;
            return response;
        }
    } as unknown as Response;

    t.plan(5);
    await getChargingPointStatus(request, response);
    t.equal(output.chargingPointId, westgateCid);
    t.equal(output.status, "available");
    t.equal(output.bays.length, 3);
    output = {};
    (request as any).params = {id: -1};
    await getChargingPointStatus(request, response);
    t.equal(respStatus, 404);
    output = {};
    (request as any).params = {id: 3.3};
    await getChargingPointStatus(request, response);
    t.equal(respStatus, 500);
});

t.test('test chargingPointAccessibility', async t => {
    const westgateCid = (await getChargingPointIdFromShorthand("WESTGATE")).charging_point_id;
    const request = {params: {id: westgateCid}} as unknown as Request;
    var respStatus = 200;
    var output : any = null;
    const response = {
        body: {}, 
        status: (s : any) => {
            respStatus = s;
            return response;
        },
        json: (b : any) => {
            output = b;
            return response;
        }
    } as unknown as Response;
    await getChargingPointAccessibility(request, response);
    t.plan(5);
    t.equal(output.chargingPointId, westgateCid);
    t.equal(respStatus, 200);
    t.match(output.bays, [
        {
            "charging_bay_number": 1,
            "bay_type_name": 'USB-C',
            "is_operational": true,
            "wheelchair_accessible": true,
            "blocked_socket": false,
            "accessibility_notes": "Step-free access"
        },
        {
            "charging_bay_number": 2
        },
        {
            "charging_bay_number": 3
        }
    ]);
    output = {};
    (request as any).params = {id: -1};
    await getChargingPointAccessibility(request, response);
    t.equal(respStatus, 404);
    output = {};
    (request as any).params = {id: 3.3};
    await getChargingPointAccessibility(request, response);
    t.equal(respStatus, 500);
});

t.test('test chargingPointsByDistance', async t => {
    const request = {query: {latitude: 50.260211, longitude: -5.066318, maxDistance: 0.1}} as unknown as Request;
    var respStatus = 200;
    var output : any = null;
    const response = {
        body: {}, 
        status: (s : any) => {
            respStatus = s;
            return response;
        },
        json: (b : any) => {
            output = b;
            return response;
        }
    } as unknown as Response;

    t.plan(6);
    await getChargingPointsWithinDistance(request, response);
    t.equal(respStatus, 204);
    output = {};
    respStatus = 200;
    (request as any).query = {latitude: 50.260211, longitude: -5.066318, maxDistance: 10};
    await getChargingPointsWithinDistance(request, response);
    t.equal(output.length, 1);
    t.equal(respStatus, 200);
    output = {};
    respStatus = 200;
    (request as any).query = {latitude: 50.260211, longitude: -5.066318, maxDistance: 700};
    await getChargingPointsWithinDistance(request, response);
    t.equal(respStatus, 200);
    output = {};
    respStatus = 200;
    (request as any).query = {latitude: 50.260211, longitude: -5.066318};
    await getChargingPointsWithinDistance(request, response);
    t.equal(respStatus, 400);
    output = {};
    respStatus = 200;
    (request as any).query = {latitude: 50.260211, longitude: -5.066318, maxDistance: "twenty@@22"};
    await getChargingPointsWithinDistance(request, response);
    t.equal(respStatus, 500);
});

t.test('test making points', async t => {
    var madepoint = false;
    var madebay = false;
    try {
        const request = {} as unknown as Request;
        var respStatus = 200;
        var output : any = null;
        const response = {
            body: {}, 
            status: (s : any) => {
                respStatus = s;
                return response;
            },
            json: (b : any) => {
                output = b;
                return response;
            }
        } as unknown as Response;

        await createChargingPoint(request, response);
        t.equal(respStatus, 400);
        t.match(output,
            {
                error: "owner_id, shorthand_name and charging_point_name are required"
            }
        );

        respStatus = 200;
        (request as any).body = {};
        (request as any).body.owner_id = -1;
        await createChargingPoint(request, response);
        t.equal(respStatus, 400);
        t.match(output,
            {
                error: "owner_id, shorthand_name and charging_point_name are required"
            }
        );

        respStatus = 200;
        (request as any).body.shorthand_name = "WESTGATE";
        await createChargingPoint(request, response);
        t.equal(respStatus, 400);
        t.match(output,
            {
                error: "owner_id, shorthand_name and charging_point_name are required"
            }
        );

        respStatus = 200;
        (request as any).body.charging_point_name = "Duplicate test fail";
        await createChargingPoint(request, response);
        t.equal(respStatus, 400);
        t.match(output,
            {
                error: "shorthand_name must be unique"
            }
        );

        respStatus = 200;
        (request as any).body.owner_id = "this shouldn't work";
        (request as any).body.shorthand_name = "UNIT-TEST1";
        (request as any).body.charging_point_name = "fail test";
        await createChargingPoint(request, response);
        madepoint = true;
        t.equal(respStatus, 500);
        t.match(output,
            {
                error: 'Failed to create charging point'
            }
        );

        respStatus = 200;
        const owner = await pool.query(
            `
                SELECT 
                    org.organisation_id
                FROM
                    organisations org
                WHERE
                    organisation_name = $1
            `,
            ['Supaspeed123 Ltd.']
        );
        if (!owner) throw new Error("couldn't get sample org");
        (request as any).body.owner_id = owner.rows[0].organisation_id;
        (request as any).body.shorthand_name = "UNIT-TEST1";
        (request as any).body.charging_point_name = "success test";
        await createChargingPoint(request, response);
        t.equal(respStatus, 201);
        t.match(output,
            {
                message: "Charging point created successfully"
            }
        );
        const point = output;

        (request as any).body = {};
        (request as any).params = {};
        await updateChargingPoint(request, response);
        t.equal(respStatus, 404);
        respStatus = 200;
        (request as any).params = {
            id: point.chargingPoint.charging_point_id
        };
        (request as any).body = {
            charging_point_name: "Updated",
            charging_point_location: "Updated, UP4 373",
            latitude: 1,
            longitude: 1,
            shorthand_name: "WESTGATE",
        };
        await updateChargingPoint(request, response);
        t.equal(respStatus, 400);
        t.match(output, {
            error: "shorthand_name must be unique"
        });

        respStatus = 200;
        (request as any).params = {
            id: point.chargingPoint.charging_point_id
        };
        (request as any).body = {
            charging_point_name: "Updated",
            charging_point_location: "Updated, UP4 373",
            latitude: 1,
            longitude: 1,
            shorthand_name: "UNIT-TEST2",
        };
        await updateChargingPoint(request, response);
        t.equal(respStatus, 200);
        t.match(output, {
            message: "Charging point updated succesfully",
            chargingPoint: {
                charging_point_name: "Updated",
                charging_point_location: "Updated, UP4 373",
                latitude: 1,
                longitude: 1,
                shorthand_name: "UNIT-TEST2"
            }
        });

        (request as any).params = {};
        (request as any).body = {};
        respStatus = 200;
        await getChargingBaysByChargingPoint(request, response);
        t.equal(respStatus, 404);
        t.match(output, {error: "No charging bays found for this charging point"});
        
        (request as any).params = {
            id: point.chargingPoint.charging_point_id
        };
        respStatus = 200;
        await getChargingBaysByChargingPoint(request, response);
        t.equal(respStatus, 404);
        t.match(output, {error: "No charging bays found for this charging point"});

        respStatus = 200;
        await createChargingBay(request, response);
        t.equal(respStatus, 400);
        t.match(output, {
            error: "charging_bay_number and bay type are required"
        });

        const bay_types = await pool.query(
            "SELECT bay_type_id FROM bay_types WHERE bay_type_name = $1",
            ["USB-C"]
        );
        if (!bay_types) throw new Error("couldn't get usb-c bay type");
        madebay = true;

        respStatus = 200;
        (request as any).body = {
            charging_bay_number: 1,
            bay_type: bay_types.rows[0].bay_type_id,
            is_operational: "of course not"
        };
        await createChargingBay(request, response);
        t.equal(respStatus, 500);
        t.match(output, {
            error: "Failed to create charging bay"
        });
        respStatus = 200;
        (request as any).body = {
            charging_bay_number: 1,
            bay_type: bay_types.rows[0].bay_type_id,
            is_operational: true
        };
        await createChargingBay(request, response);
        t.equal(respStatus, 201);
        t.match(output, {
            message: "Charging bay created successfully"
        });
        const bay = output.chargingBay.charging_bay_id;

        (request as any).params = {
            id: point.chargingPoint.charging_point_id
        };
        respStatus = 200;
        await getChargingBaysByChargingPoint(request, response);
        t.equal(respStatus, 200);
        t.match(output, {chargingPointId: point.chargingPoint.charging_point_id});
        
        (request as any).params = {
            id: "cheese"
        };
        respStatus = 200;
        await getChargingBaysByChargingPoint(request, response);
        t.equal(respStatus, 500);
        t.match(output, {error: "Failed to fetch charging bays"});

        (request as any).params = null;
        (request as any).body = null;
        respStatus = 200;
        await updateChargingBay(request, response);
        t.equal(respStatus, 400);
        (request as any).params = {
            id: -1
        };
        (request as any).body = {

        };
        respStatus = 200;
        await updateChargingBay(request, response);
        t.equal(respStatus, 404);

        (request as any).params = {
            id: -1
        };
        (request as any).body = null;
        respStatus = 200;
        await updateChargingBay(request, response);
        t.equal(respStatus, 400);

        respStatus = 200;
        (request as any).params = {
            id: point.chargingPoint.charging_point_id
        };
        (request as any).body = {
            is_operational: "maybe, who knows?"
        };
        await updateChargingBay(request, response);
        t.equal(respStatus, 500);

        respStatus = 200;
        (request as any).params = {
            id: bay
        };
        (request as any).body = {
            is_operational: false
        };
        await updateChargingBay(request, response);
        t.equal(respStatus, 200);
        t.match(output, {
            message: "Charging bay updated successfully",
            chargingBay: {
                is_operational: false
            }
        });

        respStatus = 200;
        await getChargingPointStats(request, response);
        t.equal(respStatus, 200);
        t.not(output, null);

        (request as any).params = {id: -1};
        (request as any).body = null;
        respStatus = 200;
        await deleteChargingPoint(request, response);
        t.equal(respStatus, 404);

        (request as any).params = {id: "cheese"};
        respStatus = 200;
        await deleteChargingPoint(request, response);
        t.equal(respStatus, 500);

        (request as any).params = {id: point.chargingPoint.charging_point_id};
        respStatus = 200;
        await deleteChargingPoint(request, response);
        t.equal(respStatus, 400);

        await pool.query(
                    `
                    DELETE FROM 
                        charging_bays
                    WHERE
                        charging_point_id 
                    IN (SELECT charging_point_id FROM charging_points WHERE shorthand_name IN ($1, $2));
                    `,
                    [
                        "UNIT-TEST1", "UNIT-TEST2"
                    ]
                );
        
        (request as any).params = {id: point.chargingPoint.charging_point_id};
        respStatus = 200;
        await deleteChargingPoint(request, response);
        t.equal(respStatus, 200);
        t.match(output, {
            message: "Charging point deleted successfully"
        });
    }
    catch (error) {
        console.error(error);
        t.fail("error thrown");
    }
    finally {
        if (madepoint) {
            if (madebay) {
                await pool.query(
                    `
                    DELETE FROM 
                        charging_bays
                    WHERE
                        charging_point_id 
                    IN (SELECT charging_point_id FROM charging_points WHERE shorthand_name IN ($1, $2));
                    `,
                    [
                        "UNIT-TEST1", "UNIT-TEST2"
                    ]
                );
            }
            await pool.query(
                `
                DELETE FROM 
                    charging_points
                WHERE
                    shorthand_name = $1;
                `,
                ["UNIT-TEST1"]
            );
            await pool.query(
                `
                DELETE FROM 
                    charging_points
                WHERE
                    shorthand_name = $1;
                `,
                ["UNIT-TEST2"]
            );

            
        }
    }
    
})




