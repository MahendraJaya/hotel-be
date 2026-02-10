import bcrypt, { compare } from "bcrypt";
import e, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import z from "zod";

type User = {
  email: string;
  name: string;
  password: string;
  role: string;
  image?: string;
  imageId?: string;
};

const createUserSchema = z.object({
  email: z.string(),
  name: z.string(),
  password: z.string(),
  role: z.string(),
})
export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log(req.body);
  try {
    const parseBody = createUserSchema.safeParse(req.body);
    if(!parseBody.success){
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return
    }
    const { email, name, password, role }: User = parseBody.data;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword,
        role: role.toString(),
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.log("Error while creating user : ", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong when creating user.",
    });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({});
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.log("Error while getting users : ", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong when getting users.",
    });
  }
};

const getUserByIdSchema = z.object({ id: z.coerce.number().int() });
export const getUserById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseParams = getUserByIdSchema.safeParse(req.params);
    if (!parseParams.success) {
      res.status(404).json({
        success: false,
        message: "Invalid query parameters",
        data: null,
      });
      return;
    }
    const { id } = parseParams.data;
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.log("Error while getting user : ", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong when getting user.",
    });
  }
};

const signInSchema = createUserSchema.pick({ email: true, password: true });
export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseBody = signInSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        data: null,
      });
      return;
    }
    const { email, password } = parseBody.data;
    const findEmail = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!findEmail) {
      res.status(400).json({
        success: false,
        message: "The email does not exist",
        data: null,
      });
      return;
    }
    const comparePassword = await bcrypt.compare(password, findEmail.password);
    if (!comparePassword) {
      res.status(400).json({
        success: false,
        message: "The password is incorrect",
        data: null,
      });
      return;
    }
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jwt.sign(
      {
        id: findEmail.id,
        email: findEmail.email,
        name: findEmail.name,
        role: findEmail.role,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        token: token,
      },
    });
  } catch (error) {
    console.log("Error while signing in : ", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong when signing in.",
    });
  }
};
