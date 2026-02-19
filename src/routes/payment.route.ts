import { Router } from "express";
import { checkMidtransPayment, payBooking } from "../controllers/payment.controller";

const router = Router();

router.post("/booking/", payBooking);
router.get("/check/:id", checkMidtransPayment);

export default router;