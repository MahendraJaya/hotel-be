import {
  createBooking,
  updateBooking,
} from "./../controllers/booking.controller";
import { Router } from "express";
import { getBooking, getBookingById } from "../controllers/booking.controller";
import { authentication } from "../middleware/authentication.middleware";

const router = Router();

router.get("/", authentication, getBooking);
router.get("/:id", authentication, getBookingById);
router.post("/", authentication, createBooking);
router.put("/:id", authentication, updateBooking);

export default router;
