import { Router } from "express";
import { getReportTypes } from "../controller/reportingController";

const router = Router();

router.get("/report-types", getReportTypes);

export default router;