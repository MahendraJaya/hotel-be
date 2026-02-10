import { Response } from "express";

type TResponse<T> = {
  success: boolean;
  message?: string;
  data?: T | null;
};
export const getResponse = <T>(
  res: Response,
  { success, message, data }: TResponse<T>,
): Response => {
  const retResponse = success
    ? res.status(200).json({ success, message, data })
    : res.status(500).json({ success, message, data });

  return retResponse;
};
