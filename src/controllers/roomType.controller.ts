import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import z from "zod";

interface TRoomType {
  id: number;
  name: string;
}

const createRoomTypeSchema = z.object({
  name: z.string(),
});
export const createRoomType = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseBody = createRoomTypeSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const { name } = parseBody.data;
    const roomType = await prisma.roomType.create({
      data: {
        name: name,
      },
    });

    res.status(201).json({
      success: true,
      message: "Room Type created successfully",
      data: roomType,
    });
  } catch (error) {
    console.log("Error while creating room type : ", error);
    res.status(500).json({
      success: false,
      message: "Error while creating room type",
      data: null,
    });
  }
};

export const getRoomType = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const roomTypes = await prisma.roomType.findMany({});

    res.status(200).json({
      success: true,
      message: "Room Types fetched successfully",
      data: roomTypes,
    });
  } catch (error) {
    console.log("Error while getting room type : ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting room type",
      data: null,
    });
  }
};

export const getRoomTypeById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const roomTypes = await prisma.roomType.findMany({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Room Types fetched successfully",
      data: roomTypes,
    });
  } catch (error) {
    console.log("Error while getting room type : ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting room type",
      data: null,
    });
  }
};

export const updateRoomType = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const parseBody = createRoomTypeSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const { name } = parseBody.data;
    const existedRoomType = await prisma.roomType.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existedRoomType) {
      res.status(404).json({
        success: false,
        message: "Room Type not found",
        data: null,
      });
      return;
    }

    const updatedRoomType = await prisma.roomType.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
      },
    });

    res.status(200).json({
      success: true,
      message: "Room Type updated successfully",
      data: updatedRoomType,
    });
  } catch (error) {
    console.log("Error while updating room type : ", error);
    res.status(500).json({
      success: false,
      message: "Error while updating room type",
      data: null,
    });
  }
};
