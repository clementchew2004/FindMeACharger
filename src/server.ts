import dotenv from "dotenv";
dotenv.config();

import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth";
import { authMiddleware } from "./middleware/auth";
import chargingPointsRoutes from "./routes/chargingPointsRoutes";
import mapRoutes from "./routes/mapRoutes";
import reportingRoutes from "./routes/reportingRoutes";
import reportRoutes from "./routes/reportsRoutes";
import userRoutes from "./routes/userRoutes";
import bookingRoutes from "./routes/bookingRoutes";

const app = express();
const port = 8000;

app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN || "http://localhost:5173", "http://localhost:8000"],
    credentials: true,
  })
);

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json());

// require login for all routes under /api
// currently this is conditionally bypassed for development, see ./middleware/auth.ts for details
app.use("/api", authMiddleware); 

app.use("/api", chargingPointsRoutes);
app.use("/api", mapRoutes);
app.use("/api", reportingRoutes);
app.use("/api", reportRoutes)
app.use("/api", userRoutes);
app.use("/api", bookingRoutes);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});