import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth";
import chargingPointsRoutes from "./routes/chargingPointsRoutes";
import mapRoutes from "./routes/mapRoutes";

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

app.use("/api", chargingPointsRoutes);
app.use("/api", mapRoutes);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});