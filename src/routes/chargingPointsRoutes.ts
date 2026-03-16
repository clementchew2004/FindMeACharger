import { Router } from "express";
import { getChargingPointStatus } from "../controller/chargingPointController";

const router = Router();

router.get("/charging-points/:id/status", getChargingPointStatus)

export default router;