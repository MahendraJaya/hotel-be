import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";

const createGuestSchema = z.object({
  id: z.coerce.number().int(),
  address: z.string(),
  name: z.string(),
  email: z.string(),
  dateOfBirth: z.string(),
  // userId: z.coerce.number().int(),
});

export const getAllGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const guest = await prisma.guest.findMany({});
    res.status(200).json({
      success: true,
      message: "Guest fetched successfully",
      data: guest,
    });
  } catch (error) {
    console.log("Error while getting guest : ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting guest",
      data: null,
    });
  }
}

export const createGuest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseBody = createGuestSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      console.log(parseBody.error);
      return;
    }
    const { id, address, name, email, dateOfBirth } = parseBody.data;
    const guest = await prisma.guest.create({
      data: {
        id: id.toString(),
        address: address,
        name: name,
        email: email,
        dateOfBirth: new Date(dateOfBirth),
        userId: 1,
      },
    });

    res.status(201).json({
      success: true,
      message: "Guest created successfully",
      data: guest,
    });
  } catch (error) {
    console.log("Error while creating guest : ", error);
    res.status(500).json({
      success: false,
      message: "Error while creating guest",
      data: null,
    });
  }
};

const getGuestSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});

export const getGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedQuery = getGuestSchema.safeParse(req.query);
    if (!parsedQuery.success) {
      res.status(404).json({
        success: false,
        message: "Invalid query parameters",
        data: null,
      });
      return;
    }
    const { page, limit, search } = req.query;
    const pageNumber = Number(page) || 1;
    const pageLimit = Number(limit) || 5;
    const skip = (pageNumber - 1) * pageLimit;

    const where: Prisma.GuestWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search as string,
          },
        },
        {
          id: {
            equals: search.toString(),
          },
        },
      ];
    }

    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        take: pageLimit,
        skip,
      }),
      prisma.guest.count({
        where,
      }),
    ]);

    // const a = await prisma.guest.findMany({})

    res.status(200).json({
      success: true,
      message: "Guest fetched successfully",
      data: guests,
      meta: {
        total,
        page: pageNumber,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    console.log("Error while getting guest : ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting guest",
      data: null,
    });
  }
};

const getGuestByIdSchema = z.object({
  id: z.string(),
});

export const getGuestById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseParams = getGuestByIdSchema.safeParse(req.params);
    if (!parseParams.success) {
      res.status(404).json({
        success: false,
        message: "Invalid query parameters",
        data: null,
      });
      return;
    }
    const { id } = req.params;
    const guest = await prisma.guest.findUnique({
      where: {
        id: id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Guest fetched successfully",
      data: guest,
    });
  } catch (error) {
    console.log("Error while getting guest : ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting guest",
      data: null,
    });
  }
};

const updateGuestSchema = createGuestSchema;
export const updateGuest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseBody = updateGuestSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const { id } = req.params;
    const { address, name, email, dateOfBirth } = parseBody.data;
    const findGuest = await prisma.guest.findUnique({
      where: {
        id: id.toString(),
      },
    });
    if (!findGuest) {
      res.status(404).json({
        success: false,
        message: "Guest not found",
        data: null,
      });
      return;
    }
    const parsedDOB = dateOfBirth ? new Date(dateOfBirth) : undefined;
    const guest = await prisma.guest.update({
      where: {
        id: id.toString(),
      },
      data: {
        address: address ,
        name: name ,
        email: email ,
        dateOfBirth: parsedDOB,
      },
    });
    res.status(200).json({
      success: true,
      message: "Guest updated successfully",
      data: guest,
    });
  } catch (error) {
    console.log("Error while updating guest : ", error);
    res.status(500).json({
      success: false,
      message: "Error while updating guest",
      data: null,
    });
  }
};
