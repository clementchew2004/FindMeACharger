import { Request, Response } from "express";
import t from "tap";
import { authMiddleware } from "../src/middleware/auth";

t.test("test auth middleware", async t => {
  t.test("unauthenticated access is blocked", async t => {
    // dev environment has auth bypass
    // setting to something else to test properly
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";

    const req = { headers: {} } as Request;
    let respStatus = 200;
    let output: any = null;
    const res = {
      status: (s: number) => { respStatus = s; return res; },
      json: (j: any) => { output = j; return res; }
    } as unknown as Response;

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    try {
      await authMiddleware(req, res, next);
      t.equal(respStatus, 401, "returns 401");
    } finally {
      process.env.NODE_ENV = oldEnv; // reset env
    }
  });

});
