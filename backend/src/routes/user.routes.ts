import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { updateProfileSchema } from "../schemas/user.schema.js";

const router = Router();

/**
 * GET /api/users/profile
 */
router.get("/profile", requireAuth, getProfile);

/**
 * PUT /api/users/profile
 */
router.put(
    "/profile",
    requireAuth,
    validateRequest(updateProfileSchema),
    updateProfile
);

export default router;
