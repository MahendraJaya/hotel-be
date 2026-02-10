import { Router } from "express";
import {
  createRoom,
  getRoom,
  getRoomById,
  updateRoom,
} from "../controllers/room.controller";

const router = Router();

router.get("/", getRoom);
router.put("/:id", updateRoom);
router.post("/", createRoom);
router.get("/:id", getRoomById);

export default router;
