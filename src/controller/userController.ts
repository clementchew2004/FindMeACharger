import { Request, Response } from "express";
import { pool } from "../lib/db";

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorised" });
    }

    const result = await pool.query(
      `SELECT name, email, public_name FROM "user" WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorised" });
    }

    const { name, public_name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Username is required" });
    }

    const result = await pool.query(
      `UPDATE "user" 
       SET name = $1, public_name = $2, "updatedAt" = NOW() 
       WHERE id = $3 
       RETURNING name, email, public_name`,
      [name.trim(), public_name?.trim() || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error(error);
    
    // unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ error: "Username is already taken" });
    }
    
    res.status(500).json({ error: "Failed to update profile" });
  }
};
