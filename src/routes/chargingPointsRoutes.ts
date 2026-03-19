import { Router } from "express";
import { getChargingPointStatus, getChargingPointsWithinDistance, getChargingPointAccessiblity} from "../controller/chargingPointController";
import { getAllChargingPoints, createChargingPoint, updateChargingPoint, deleteChargingPoint } from "../controller/chargingPointController";

const router = Router();

router.get("/charging-points/:id/status", getChargingPointStatus)
router.get("/charging-points/:id/accessibility", getChargingPointAccessiblity)

router.get("/charging-points/nearby", getChargingPointsWithinDistance)

router.get("/charging-points", getAllChargingPoints)
router.post("/create-charging-point", createChargingPoint)
router.patch("/update-charging-point/:id", updateChargingPoint)
router.delete("/delete-charging-point/:id", deleteChargingPoint)

export default router;