import t from "tap"
import { Request, Response } from "express";
import {pool} from "../src/lib/db";
import {getReportType, createReport, getReports} from "../src/controller/reportsController";

t.test('test reports', async t => {
    t.test('test getReportTypes', async t => {
        const request = {

        } as unknown as Request;

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
        await getReportType(request, response);
        t.equal(respStatus, 200);
        t.not(output, null);
    });

    t.test('test getReports', async t => {
        const request = {

        } as unknown as Request;

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
        await getReports(request, response);
        t.equal(respStatus, 200);
        t.not(output, null);
    })

    t.test('test createReport', async t => {
        const request = {

        } as unknown as Request;

        var respStatus = 200;
        var output : any = null;
        const response = {
            body: null, 
            status: (s : any) => {
                respStatus = s;
                return response;
            },
            json: (b : any) => {
                output = b;
                return response;
            }
        } as unknown as Response;
        await createReport(request, response);
        t.equal(respStatus, 500);
        t.match(output, {
            error: "Request body is missing"
        });

        (request as any).body = {
            reporter_id: -1,
            charging_point_id: -1,
            report_reason: -1,
            report_description: "something",
            booking_id: null
        };
        respStatus = 200;
        output = null;
        (response as any).body = null;
        await createReport(request, response);
        t.equal(respStatus, 400);
        t.match(output, {error: "reporter_id, charging_point_id, report_reason are required to make a report"});

        (request as any).body = {
            charging_point_id: -1,
            report_reason: -1,
            report_description: "something",
            booking_id: null
        };
        respStatus = 200;
        output = null;
        (response as any).body = null;
        await createReport(request, response);
        t.equal(respStatus, 400);
        t.match(output, {error: "reporter_id, charging_point_id, report_reason are required to make a report"});

        (request as any).body = {
            reporter_id: -1,
            report_reason: -1,
            report_description: "something",
            booking_id: null
        };
        respStatus = 200;
        output = null;
        (response as any).body = null;
        await createReport(request, response);
        t.equal(respStatus, 400);
        t.match(output, {error: "reporter_id, charging_point_id, report_reason are required to make a report"});

        (request as any).body = {
            reporter_id: -1,
            charging_point_id: -1,
            report_description: "something",
            booking_id: null
        };
        respStatus = 200;
        output = null;
        (response as any).body = null;
        await createReport(request, response);
        t.equal(respStatus, 400);
        t.match(output, {error: "reporter_id, charging_point_id, report_reason are required to make a report"});


        const user = await pool.query(
            `
                SELECT customers.customer_id
                FROM customers
                WHERE customers.user_id = (SELECT id FROM "user" WHERE "user".name = $1);
            `,
            ["mo_mo123"]
        );
        const charging_point = await pool.query(
            `
                SELECT point.charging_point_id
                FROM charging_points point
                WHERE point.shorthand_name = $1
            `,
            ["WESTGATE"]
        );
        var rrrstat = 200;
        var rrrput : any[] = [];
        const report_reason_response = {
            body: null, 
            status: (s : any) => {
                rrrstat = s;
                return response;
            },
            json: (b : any) => {
                rrrput = b;
                return response;
            }
        } as unknown as Response;
        await getReportType({} as unknown as Request, report_reason_response);
        (request as any).body = {
            reporter_id: user.rows[0].customer_id,
            charging_point_id: charging_point.rows[0].charging_point_id,
            report_reason: rrrput[0].report_type_id,
            report_description: "valid test report",
            booking_id: null
        };
        respStatus = 200;
        output = null;
        (response as any).body = null;
        await createReport(request, response);
        t.equal(respStatus, 201);
        t.match(output, {
            message: "Report created successfully",
            report: {
                reporter_id: user.rows[0].customer_id,
                charging_point_id: charging_point.rows[0].charging_point_id,
                report_reason: rrrput[0].report_type_id,
                report_description: "valid test report",
                booking_id: null
            }
        });
        await pool.query(
            `DELETE FROM reports WHERE report_description = $1`,
            ["valid test report"]
        );
    });
});