import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authentication = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Error while authenticating user : ", error);
    res
      .status(500)
      .json({ message: "Something went wrong when authenticating user" });
  }
};
