import { Router } from "express";
import { getUserProfile, updateUserProfile, getCurrentUser } from "../controller/userController";

const router = Router();

router.get("/user/profile", getUserProfile);
router.put("/user/profile", updateUserProfile);

router.get("/me", getCurrentUser);

export default router;
