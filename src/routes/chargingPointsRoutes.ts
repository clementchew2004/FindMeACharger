import { Router } from "express";
import { getChargingPointStatus, getChargingPointsWithinDistance } from "../controller/chargingPointController";

const router = Router();

router.get("/charging-points/:id/status", getChargingPointStatus)
router.get("/charging-points/nearby", getChargingPointsWithinDistance)
export default router;