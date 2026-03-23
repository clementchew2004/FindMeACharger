import { Router } from "express";
import { getChargingPointStatus, getChargingPointsWithinDistance, getChargingPointAccessibility} from "../controller/chargingPointController";
import { getAllChargingPoints, createChargingPoint, updateChargingPoint, deleteChargingPoint } from "../controller/chargingPointController";
import { getChargingBaysByChargingPoint, createChargingBay, updateChargingBay } from "../controller/chargingPointController";
import { filterChargingPoints, getBayTypes } from "../controller/chargingPointController";
import { authMiddleware } from "../middleware/auth";
import { requireModOrOp } from "../middleware/rbac";

const router = Router();

// Public routes
router.get("/bay-types", getBayTypes)
router.get("/charging-points/:id/status", getChargingPointStatus)
router.get("/charging-points/:id/accessibility", getChargingPointAccessibility)
router.get("/charging-points/nearby", getChargingPointsWithinDistance)
router.get("/charging-points", getAllChargingPoints)
router.get("/charging-points/:id/bays", getChargingBaysByChargingPoint)
router.get("/charging-points/filter", filterChargingPoints)

// Protected admin routes
router.post("/charging-points", authMiddleware, requireModOrOp, createChargingPoint)
router.patch("/charging-points/:id", authMiddleware, requireModOrOp, updateChargingPoint)
router.delete("/charging-points/:id", authMiddleware, requireModOrOp, deleteChargingPoint)

router.post("/charging-points/:id/bays", authMiddleware, requireModOrOp, createChargingBay)
router.patch("/charging-bays/:id", authMiddleware, requireModOrOp, updateChargingBay)

export default router;