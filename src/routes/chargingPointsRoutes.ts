import { Router } from "express";
import { getChargingPointStatus, getChargingPointsWithinDistance, getChargingPointAccessiblity} from "../controller/chargingPointController";

const router = Router();

router.get("/charging-points/:id/status", getChargingPointStatus)
router.get("/charging-points/:id/accessibility", getChargingPointAccessiblity)
router.get("/charging-points/nearby", getChargingPointsWithinDistance)

export default router;