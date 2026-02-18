import { Router } from "express";
import { payBooking } from "../controllers/payment.controller";

const router = Router();

router.post("/booking", payBooking);

export default router;