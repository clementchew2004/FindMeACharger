import { Request, Response } from "express";
import t from "tap";
import { getRoute } from "../src/controller/mapController";

t.test("test mapController getRoute", async t => {
  t.test("returns 400 if missing start or end", async t => {
    const req = { query: { start: "1,1" } } as unknown as Request;
    let respStatus = 200;
    let output: any = null;
    const res = {
      status: (s: number) => { respStatus = s; return res; },
      json: (j: any) => { output = j; return res; }
    } as unknown as Response;

    await getRoute(req, res);

    t.equal(respStatus, 400);
    t.match(output, { error: "Missing start or end coordinates" });
  });

  t.test("returns 500 when fetch returns error", async t => {
    const req = { query: { start: "1,1", end: "2,2", mode: "foot-walking" } } as unknown as Request;
    let respStatus = 200;
    let output: any = null;
    const res = {
      status: (s: number) => { respStatus = s; return res; },
      json: (j: any) => { output = j; return res; }
    } as unknown as Response;

    // mock fetch
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return {
        ok: false,
        status: 403
      } as globalThis.Response;
    };

    try {
      await getRoute(req, res);
      t.equal(respStatus, 500);
      t.match(output, { error: "Failed to fetch route" });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  t.test("returns data when fetch is ok", async t => {
    const req = { query: { start: "1,1", end: "2,2", mode: "foot-walking" } } as unknown as Request;
    let respStatus = 200;
    let output: any = null;
    const res = {
      status: (s: number) => { respStatus = s; return res; },
      json: (j: any) => { output = j; return res; }
    } as unknown as Response;

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ features: ["mock data"] })
      } as globalThis.Response;
    };

    try {
      await getRoute(req, res);
      t.equal(respStatus, 200);
      t.match(output, { features: ["mock data"] });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
