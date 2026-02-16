import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";
import { z } from "zod";

type TRoom = {
  name: string;
  maxCapacity: number;
  description?: string;
  roomtypeId: number;
  availability: boolean;
  price: number;
  floor: number;
  roomNumber: string;
};

const getRoomsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  startdate: z.string().optional(),
  enddate: z.string().optional(),
  roomtype: z.string().optional(),
});

const createRoomSchema = z.object({
  name: z.string(),
  maxCapacity: z.coerce.number().int(),
  description: z.string().optional(),
  roomtypeId: z.coerce.number().int(),
  availability: z.boolean().optional(),
  price: z.coerce.number().int(),
  floor: z.coerce.number().int(),
  roomNumber: z.string(),
});

const getRoomByIdSchema = z.object({
  id: z.string(),
});

export const createRoom = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parsedBody = createRoomSchema.safeParse(req.body);
    if (!parsedBody.success) {
      console.log(parsedBody.error);
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const {
      name,
      maxCapacity,
      description,
      roomtypeId,
      availability,
      price,
      floor,
      roomNumber,
    }= parsedBody.data;

    const room = await prisma.room.create({
      data: {
        name: name,
        maxCapacity: maxCapacity,
        description: description,
        roomtypeId: roomtypeId,
        availability: availability,
        price: price,
        floor: floor,
        roomNumber: roomNumber,
      },
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    console.log("Error while creating room : ", error);
    res.status(500).json({
      success: false,
      message: "Error while creating room",
      data: null,
    });
  }
};

export const getRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedQuery = getRoomsSchema.safeParse(req.query);
    if (!parsedQuery.success) {
      res.status(404).json({
        success: false,
        message: "Invalid query parameters",
        data: null,
      });
      return;
    }

    const { page = 1, limit = 10, startdate, enddate, roomtype } = parsedQuery.data;
    const pageNumber = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (pageNumber - 1) * pageLimit;

    const where: Prisma.RoomWhereInput = {};
    if (roomtype) {
      where.roomtypeId = Number(roomtype);
    }

    //cari room yang belom di booking pada tanggal tersebut
    if (startdate && enddate) {
      where.booking = {
        none: {
          AND: [
            {
              checkInDate: {
                gt: new Date(enddate as string),
              },
            },
            {
              checkOutDate: {
                lt: new Date(startdate as string),
              },
            },
          ],
        },
      };
    } else {
      where.availability = {
        equals: true,
      };
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: pageLimit,
        include: {
          roomtype: true,
        }
      }),
      prisma.room.count({
        where,
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Rooms fetched successfully",
      data: rooms,
      meta: {
        total,
        page: pageNumber,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    console.log("Error while getting room : ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting room",
      data: null,
    });
  }
};
export const getRoomById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseParams = getRoomByIdSchema.safeParse(req.params);
    if (!parseParams.success) {
      res.status(404).json({
        success: false,
        message: "Invalid query parameters",
        data: null,
      });
      return;
    }
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      data: room,
    });
  } catch (error) {
    console.log("Error while getting room : ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting room",
      data: null,
    });
  }
};

const updateRoomSchema = createRoomSchema.partial();
export const updateRoom = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseBody = updateRoomSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const { id } = req.params;
    const {
      name,
      maxCapacity,
      description,
      roomtypeId,
      availability,
      price,
      floor,
      roomNumber,
    } = parseBody.data;

    const room = await prisma.room.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
        maxCapacity: maxCapacity,
        description: description,
        roomtypeId: roomtypeId,
        availability: availability,
        price: price,
        floor: floor,
        roomNumber: roomNumber,
      },
    });
    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    })
  } catch (error) {
    console.log("Error while updating room : ", error);
    res.status(500).json({
      success: false,
      message: "Error while updating room",
      data: null,
    });
  }
};
