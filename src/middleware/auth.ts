import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  /*
  auth bypass for development:
  1. check for valid session
  2. if found, continue as usual
  3. else still ALLOW the request but add mock user and null/undefined session
  */

  // --------------------------------------------------
  if (process.env.NODE_ENV === "development") {
    const requestSession = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (requestSession) {
      req.user = requestSession.user;
      req.session = requestSession.session;
    } else {
      req.user = {
        id: "123",
        name: "test-user-123",
        email: "test@example.com",
        emailVerified: false,
        publicName: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return next();
  }
  // --------------------------------------------------

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({ message: "Unauthorised" });
  }

  req.user = session.user;
  req.session = session.session;

  next();
};