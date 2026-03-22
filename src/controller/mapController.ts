import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const ORS_API_KEY = process.env.ORS_API_KEY;

export const getRoute = async (req: Request, res: Response) => {
  const { start, end, mode } = req.query; // lng,lat

  if (!start || !end) {
    res.status(400).json({ error: "Missing start or end coordinates" });
    return;
  }

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/${mode}?api_key=${ORS_API_KEY}&start=${start}&end=${end}`
      // mode can be foot-walking, wheelchair, cycling-regular, or driving-car
    );

    if (!response.ok) {
      throw new Error(`ORS API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching route:", error);
    res.status(500).json({ error: "Failed to fetch route" });
  }
};
