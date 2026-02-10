import { Router } from "express";
import { createRoomType, getRoomType, getRoomTypeById, updateRoomType } from "../controllers/roomType.controller";
import { authentication } from "../middleware/authentication.middleware";

const router = Router();

router.post("/", authentication, createRoomType);
router.put("/:id", authentication, updateRoomType);
router.get("/", getRoomType);
router.get("/:id", getRoomTypeById)

export default router;