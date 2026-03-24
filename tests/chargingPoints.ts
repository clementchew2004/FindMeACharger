import t from "tap"
import { Request, Response } from "express";
import { getChargingPointIdFromShorthand, getChargingPointAccessibility, getChargingPointStatus, getChargingPointsWithinDistance} from "../src/controller/chargingPointController";


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




