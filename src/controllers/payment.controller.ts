import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";

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
      where : {
        id: id.toString(),
      }
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
    status : z.string()
})

export const confirmPayment = async (req: Request, res: Response):Promise<void> => {
    try {
        const parseBody = confirmPaymentSchema.safeParse(req.body);
        if(!parseBody.success){
            res.status(400).json({
                success : false,
                message : "Invalid request body",
                data : null
            })
            return
        }
        const {status} = req.body;
        const {id} = req.params;
        const selPayment = await prisma.payment.findUnique({
            where : {
                id : id.toString()
            }
        })

        if(!selPayment){
            res.status(404).json({
                success : false,
                message : "Payment not found",
                data : null
            })
            return
        }

        if(status == "Complete" && selPayment.status != "Complete"){
            const updatedPayment = await prisma.payment.update({
                where : {
                    id : id.toString()
                },
                data : {
                    status : status
                }
            })
            await prisma.booking.update({
                where : {
                    id : selPayment.bookingId
                },
                data : {
                    status : "Waiting"
                }
            })
            res.status(200).json({
                success : true,
                message : "Payment updated successfully",
                data : updatedPayment
            })
            return
        }else if(status == "Cancel" && selPayment.status != "Cancel"){
            const updatedPayment = await prisma.payment.update({
                where : {
                    id : id.toString()
                },
                data : {
                    status : status
                }
            })
            await prisma.booking.update({
                where : {
                    id : selPayment.bookingId
                },
                data : {
                    status : "Cancel"
                }
            })
            res.status(200).json({
                success : true,
                message : "Payment updated successfully",
                data : updatedPayment
            })
            return;
        }
    } catch (error) {
        
    }
}
