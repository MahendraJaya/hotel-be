import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../lib/prisma";
import Midtrans from "midtrans-client";

const creatBookingSchema = z.object({
  id: z.string(),
  guestId: z.coerce.number().int(),
  roomId: z.coerce.number().int(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  bookingDate: z.string(),
  totalGuest: z.coerce.number().int(),
  totalDay: z.coerce.number().int(),
  status: z.string().optional(),
});
export const createBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseBody = creatBookingSchema.safeParse(req.body);
    if (!parseBody.success) {
      console.log(parseBody.error);
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const {
      id,
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      bookingDate,
      totalGuest,
      totalDay,
      status,
    } = parseBody.data;
    const booking = await prisma.booking.create({
      data: {
        id: id,
        guestId: guestId.toString(),
        roomId: roomId,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        bookingDate: new Date(bookingDate),
        totalGuest: totalGuest,
        totalDay: totalDay,
        status: status,
      },
    });
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.log("Error while creating booking ~creatingBooking : ", error);
    res.status(500).json({
      success: false,
      message: "Error while creating booking",
      data: null,
    });
  }
};

//TODO: tambahkan search dan pagination
export const getBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        room: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.log("Error while getting booking ~ getBooking: ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting booking",
      data: null,
    });
  }
};

export const getBookingById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: {
        id: id.toString(),
      },
      include: {
        guest: true,
        room: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Booking fetched successfully",
      data: booking,
    });
  } catch (error) {
    console.log("Error while getting booking ~ getBooking: ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting booking",
      data: null,
    });
  }
};

export const getCheckin = async (req: Request, res: Response) => {
  try {
    const checkin = await prisma.booking.findMany({
      where: {
        status: "waiting",
      },
      include: {
        guest: true,
        room: true,
        payment: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Checkin fetched successfully",
      data: checkin,
    });
  } catch (error) {
    console.log("Error while getting checkin ~ getCheckin: ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting checkin",
      data: null,
    });
  }
};

export const updateBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseBody = creatBookingSchema.partial().safeParse(req.body);
    if (!parseBody.success) {
      console.log(parseBody.error);
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const { id } = req.params;
    const {
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      bookingDate,
      totalGuest,
      status,
    } = parseBody.data;
    const parseCheckIn = checkInDate ? new Date(checkInDate) : undefined;
    const parseCheckOut = checkOutDate ? new Date(checkOutDate) : undefined;
    const parseBookingDate = bookingDate ? new Date(bookingDate) : undefined;
    const parseGuest = guestId ? guestId.toString() : undefined;
    const booking = await prisma.booking.update({
      where: {
        id: id.toString(),
      },
      data: {
        guestId: parseGuest,
        roomId: roomId,
        checkInDate: parseCheckIn,
        checkOutDate: parseCheckOut,
        bookingDate: parseBookingDate,
        totalGuest: totalGuest,
        status: status,
      },
    });
    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    console.log("Error while updating booking ~ updateBooking: ", error);
    res.status(500).json({
      success: false,
      message: "Error while updating booking",
      data: null,
    });
  }
};

// export const payBooking = async (req: Request, res: Response) => {
//   try {
//     const midtrans = Midtrans;
//     const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
//     const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;

//     let snap = new midtrans.Snap({
//       isProduction: false,
//       clientKey: CLIENT_KEY || "",
//       serverKey: SERVER_KEY || "",
//     });

//     let parameter = {
//       transaction_details: {
//         order_id: "YOUR-ORDERID-123452",
//         gross_amount: 10000,
//       },
//       credit_card: {
//         secure: true,
//       },
//       customer_details: {
//         first_name: "budi",
//         last_name: "pratama",
//         email: "budi.pra@example.com",
//         phone: "08111222333",
//       },
//     };

//     snap.createTransaction(parameter).then((transaction) => {
//       // transaction token
//       let transactionToken = transaction.token;
//       console.log("transactionToken:", transaction);
//       res.status(200).json(transactionToken);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

//untuk updaet checkin dan checkout
export const updateCiCo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const parseBody = z
      .object({
        status: z.string(),
      })
      .safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const { status } = parseBody.data;
    //cari booking
    const findBooking = await prisma.booking.findUnique({
      where: {
        id: id.toString(),
      },
    });

    if (!findBooking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
        data: null,
      });
      return;
    }

    //pengecekan untuk update status kamar dan status bookingan
    let stat = "";
    let available = true;
    if (status == "checkin" && findBooking?.status == "waiting") {
      stat = "checkin";
      available = false;
    } else if (status == "checkout" && findBooking?.status == "checkin") {
      stat = "checkout";
    } else if (status == "cancel") {
      stat = "cancel";
    }

    //update status booking
    const updateBooking = await prisma.booking.update({
      where: {
        id: id.toString(),
      },
      data: {
        status: stat,
      },
    });

    //update status ketersediaan kamar
    await prisma.room.update({
      where: {
        id: findBooking.roomId,
      },
      data: {
        availability: available,
      },
    });

    res.status(200).json({
      success: true,
      message: `Booking updated successfully : ${status}`,
      data: updateBooking,
    });
  } catch (error) {
    console.log(
      `Error while updating ${req.body.status} ~updateCiCo : `,
      error,
    );
    res.status(500).json({
      success: false,
      message: "Error while updating checkin and checkout",
      data: null,
    });
  }
};
