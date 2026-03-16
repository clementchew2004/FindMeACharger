import { Router } from "express";
import { getChargingPointStatus, getChargingPointAccessiblity } from "../controller/chargingPointController";

const router = Router();

router.get("/charging-points/:id/status", getChargingPointStatus)
router.get("/charging-points/:id/accessibility", getChargingPointAccessiblity)

export default router;