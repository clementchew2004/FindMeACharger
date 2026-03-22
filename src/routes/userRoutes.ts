import { Router } from "express";
import { getUserProfile, updateUserProfile } from "../controller/userController";

const router = Router();

router.get("/user/profile", getUserProfile);
router.put("/user/profile", updateUserProfile);

export default router;
