import { NextFunction, Request, Response } from "express";
import { pool } from "../lib/db";

async function getUserRoles(id: string): Promise<Set<string>> {
  const roleQueries = [
    { role: "customer", table: "customers" },
    { role: "moderator", table: "moderators" },
    { role: "operator", table: "operators" },
  ];

  try {
    const roles = new Set<string>();

    for (const { role, table } of roleQueries) {
      const result = await pool.query(
        `SELECT 1 FROM ${table} WHERE user_id = $1`,
        [id]
      );
      if ((result.rowCount ?? 0) > 0) {
        roles.add(role);
      }
    }

    return roles;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    throw new Error("Failed to fetch user roles");
  }
}

function requireAnyRoleFrom(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorised" });
    }

    try {
      const roles = await getUserRoles(user.id);

      const hasAllowedRole = allowedRoles.some(role => roles.has(role));

      if (!hasAllowedRole) {
        return res.status(403).json({ error: `Forbidden: requires one of the following roles: ${allowedRoles.join(", ")}` });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

const requireRole = (requiredRole: string) => {
  return requireAnyRoleFrom([requiredRole]);
}

export const requireModerator = requireRole("moderator");
export const requireOperator = requireRole("operator");
export const requireCustomer = requireRole("customer");
export const requireModOrOp = requireAnyRoleFrom(["moderator", "operator"]);