import { Router } from "express";
import { createUser, getUser, getUserById, signIn } from "../controllers/user.controller";

const router = Router();

router.post("/", createUser);
router.get("/", getUser);
router.get("/:id", getUserById);
router.post("/signin", signIn);


export default router;