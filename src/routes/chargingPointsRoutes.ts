import { Router } from "express";
import { getChargingPointStatus, getChargingPointsWithinDistance, getChargingPointAccessiblity} from "../controller/chargingPointController";
import { getAllChargingPoints, createChargingPoint, updateChargingPoint, deleteChargingPoint } from "../controller/chargingPointController";
import { getChargingBaysByChargingPoint, createChargingBay, updateChargingBay } from "../controller/chargingPointController";
import { getChargingPointStatus, getChargingPointsWithinDistance, getChargingPointAccessibility} from "../controller/chargingPointController";

const router = Router();

router.get("/charging-points/:id/status", getChargingPointStatus)
router.get("/charging-points/:id/accessibility", getChargingPointAccessiblity)

router.get("/charging-points/nearby", getChargingPointsWithinDistance)

router.get("/charging-points", getAllChargingPoints)
router.post("/charging-points", createChargingPoint)
router.patch("/charging-points/:id", updateChargingPoint)
router.delete("/charging-points/:id", deleteChargingPoint)

router.get("/charging-points/:id/bays", getChargingBaysByChargingPoint)
router.post("/charging-points/:id/bays", createChargingBay)
router.patch("/charging-bays/:id", updateChargingBay)

router.get("/charging-points/:id/accessibility", getChargingPointAccessibility)
router.get("/charging-points/nearby", getChargingPointsWithinDistance)

export default router;