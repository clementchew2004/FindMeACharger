import { NextFunction, Request, Response } from "express";
import t from "tap";
import { requireModOrOp } from "../src/middleware/rbac";

t.test("test rbac middleware", async t => {
  t.test("returns 401 when req.user is missing/null", async t => {
    const req = {} as Request;
    let respStatus = 0;
    const res = {
      status: (s: number) => { respStatus = s; return res; },
      json: () => { return res; }
    } as unknown as Response;
    const next: NextFunction = () => { };

    await requireModOrOp(req, res, next);
    t.equal(respStatus, 401);
  });
});

