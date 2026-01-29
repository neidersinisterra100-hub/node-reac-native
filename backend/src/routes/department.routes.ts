import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
    createDepartment,
    getAllDepartments,
    toggleDepartmentActive
} from "../controllers/department.controller.js";

const router = Router();

// Public or Protected? Protected usually
router.get("/", requireAuth, getAllDepartments);
router.post("/", requireAuth, createDepartment);
router.patch("/:id/toggle", requireAuth, toggleDepartmentActive);

export default router;
