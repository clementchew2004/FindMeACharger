import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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