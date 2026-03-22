import { Router } from "express";
import { makeBooking } from "../controller/bookingController";

const router = Router();

router.post("/booking", makeBooking);

export default router;
