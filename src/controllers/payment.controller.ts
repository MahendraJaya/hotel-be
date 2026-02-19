import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../lib/prisma";
import Midtrans from "midtrans-client";

const createPaymentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  total: z.coerce.number().int(),
  paymentDate: z.string(),
  paymentMethod: z.string(),
  status: z.string().optional(),
});

export const createPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseBody = createPaymentSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(500).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const {
      id,
      bookingId,
      total,
      paymentDate,
      paymentMethod,
      status = "Waiting",
    } = req.body;
    const payment = await prisma.payment.create({
      data: {
        id: id,
        bookingId: bookingId,
        total: total,
        paymentDate: paymentDate,
        paymentMethod: paymentMethod,
        status: status,
      },
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    console.log("Error while creating payment : ", error);
    res.status(500).json({
      success: false,
      message: "Error while creating payment",
      data: null,
    });
  }
};

const getPaymentByIdSchema = z.object({
  id: z.string(),
});

export const getPaymentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseParams = getPaymentByIdSchema.safeParse(req.params);
    if (!parseParams.success) {
      res.status(404).json({
        success: false,
        message: "Invalid query parameters",
        data: null,
      });
      return;
    }
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: {
        id: id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    console.log("Error while getting payment : ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting payment",
      data: null,
    });
  }
};

const confirmPaymentSchema = z.object({
  status: z.string(),
});

const payBookingScheme = z.object({
  bookingId: z.string(),
});
export const payBooking = async (req: Request, res: Response) => {
  try {
    const midtrans = Midtrans;
    const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;

    const parseBody = payBookingScheme.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const { bookingId } = req.body;

    const bookingData = await prisma.booking.findFirst({
      where: {
        id: bookingId,
      },
      include: {
        room: true,
        guest: true,
      },
    });
    if (!bookingData) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
        data: null,
      });
      return;
    }

    const findPayment = await prisma.payment.findFirst({
      where: {
        bookingId: bookingId,
      },
    });

    let snap = new midtrans.Snap({
      isProduction: false,
      clientKey: CLIENT_KEY || "",
      serverKey: SERVER_KEY || "",
    });

    const totalPaid = bookingData.totalDay * bookingData.room.price;

    let parameter = {
      transaction_details: {
        order_id: bookingData.id,
        gross_amount: totalPaid,
      },

      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: bookingData.guest.name,
        email: bookingData.guest.email,
        guest_id: bookingData.id,
      },
    };

    snap.createTransaction(parameter).then(async (transaction) => {
      // transaction token
      let transactionToken = transaction.token;
      const payment = await prisma.payment.create({
        data: {
          id: transactionToken,
          bookingId: bookingData.id,
          total: totalPaid,
          paymentDate: new Date(),
          paymentMethod: "Midtrans",
          status: "Waiting",
          paymentToken: transactionToken,
          paymentUrl: transaction.redirect_url,
        },
      });

      res.status(200).json({
        success: true,
        message: "Payment created successfully",
        data: payment,
      });
    });
  } catch (error) {
    console.log("Error while creating payment : ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const checkMidtransPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const encodedKey = Buffer.from(`${serverKey}:`).toString("base64");
    const midtrans = Midtrans;
    const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;

    const response = await fetch(
      `https://api.sandbox.midtrans.com/v2/${id}/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedKey}`,
        },
      },
    );

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Failed to fetch Midtrans status",
      });
    }

    const findPayment = await prisma.payment.findFirst({
      where: {
        bookingId: id.toString(),
      },
      include: {
        booking: {
          include: {
            guest: true,
          },
        },
      },
    });
    if (!findPayment) {
      return res.status(404).json({
        message: "Payment not found -> ",
        id,
      });
    }

    const data = await response.json();
    if (data.status_code == 407) {
      let snap = new midtrans.Snap({
        isProduction: false,
        clientKey: CLIENT_KEY || "",
        serverKey: serverKey || "",
      });

      let parameter = {
        transaction_details: {
          order_id: findPayment.bookingId,
          gross_amount: findPayment.total || 1,
        },

        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: findPayment.booking.guest.name,
          email: findPayment.booking.guest.email,
          guest_id: findPayment.booking.guest.id,
        },
      };

      snap.createTransaction(parameter).then(async (transaction) => {
        // transaction token
        let transactionToken = transaction.token;
        const payment = await prisma.payment.update({
          where: {
            bookingId: id.toString(),
          },
          data: {
            paymentToken: transactionToken,
            paymentUrl: transaction.redirect_url,
          },
        });

        res.status(200).json({
          success: true,
          message: "Updated Midtrans Token",
          data: payment,
        });
      });
      return;
    }

    return res.status(200).json({
      success: true,
      message: "Midtrans Token not expired yet",
      data: findPayment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
