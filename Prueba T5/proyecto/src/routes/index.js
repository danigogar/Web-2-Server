import { Router } from "express";
import usersRoutes from "./users.routes.js";

const router = Router();

router.use("/users", usersRoutes);

export default router;
