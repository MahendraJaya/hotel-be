import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoute from "./routes/user.route";
import roomTypeRoute from "./routes/roomType.route";
import roomRoute from "./routes/room.route";
import guestRoute from "./routes/guest.route";
import bookingRoute from "./routes/booking.route";
import paymentRoute from "./routes/payment.route";
import { authentication } from "./middleware/authentication.middleware";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", userRoute); //done
app.use("/api/roomtype", roomTypeRoute); //done
app.use("/api/room", roomRoute); //done
app.use("/api/guest", guestRoute); //done
app.use("/api/booking", bookingRoute); 
app.use("/api/payment", paymentRoute); 
app.get("/api/mid", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
