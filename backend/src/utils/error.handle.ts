import { Response } from "express";

export const handleHttp = (res: Response, message: string) => {
  res.status(500).json({ error: message });
};
