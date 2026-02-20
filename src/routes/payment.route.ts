import { Router } from "express";
import { checkMidtransPayment, payBooking, successMidtransPayment } from "../controllers/payment.controller";

const router = Router();

router.post("/booking/", payBooking);
router.get("/check/:id", checkMidtransPayment);
router.post("/checkin/confirm", successMidtransPayment);

export default router;