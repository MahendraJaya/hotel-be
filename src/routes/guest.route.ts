import { Router } from "express";
import {
  createGuest,
  getAllGuest,
  getGuest,
  getGuestById,
  updateGuest,
} from "../controllers/guest.controller";
import { authentication } from "../middleware/authentication.middleware";

const router = Router();

router.get("/", getGuest);
router.get("/all", getAllGuest);
router.get("/:id", authentication, getGuestById);
router.post("/", authentication, createGuest);
router.put("/:id", authentication, updateGuest);

export default router;
