import {
  createBooking,
  getCheckin,
  // payBooking,
  updateBooking,
  updateCiCo,
} from "./../controllers/booking.controller";
import { Router } from "express";
import { getBooking, getBookingById } from "../controllers/booking.controller";
import { authentication } from "../middleware/authentication.middleware";

const router = Router();

router.get("/", authentication, getBooking);
router.get("/checkin", getCheckin);
router.get("/:id", authentication, getBookingById);
router.post("/", authentication, createBooking);
router.put("/:id", authentication, updateBooking);
router.put("/checkin/:id", authentication, updateCiCo);
// router.post("/checkin/payment", payBooking);

export default router;
