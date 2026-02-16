import {
  createBooking,
  getCheckin,
  updateBooking,
  updateCiCo,
} from "./../controllers/booking.controller";
import { Router } from "express";
import { getBooking, getBookingById } from "../controllers/booking.controller";
import { authentication } from "../middleware/authentication.middleware";

const router = Router();

router.get("/", authentication, getBooking);
router.get("/checkin", authentication, getCheckin);
router.get("/:id", authentication, getBookingById);
router.post("/", authentication, createBooking);
router.put("/:id", authentication, updateBooking);
router.put("/checkin/:id", authentication, updateCiCo);

export default router;
