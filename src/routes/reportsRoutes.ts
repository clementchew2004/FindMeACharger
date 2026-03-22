import { Router} from "express";
import { getReportType, createReport, getReports } from "../controller/reportsController";

const router = Router();

router.get("/report-types", getReportType)
router.post("/create-reports", createReport)
router.get("/reports", getReports)

export default router;