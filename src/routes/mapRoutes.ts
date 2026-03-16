import { Router } from "express";
import { getRoute } from "../controller/mapController";

const router = Router();

router.get("/get-route", getRoute);

export default router;
