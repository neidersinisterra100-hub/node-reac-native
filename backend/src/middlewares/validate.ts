import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export const validate = (schema: { body?: AnyZodObject; params?: AnyZodObject }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) schema.body.parse(req.body);
      if (schema.params) schema.params.parse(req.params);
      next();
    } catch (err: any) {
      res.status(400).json({ error: err.errors || err.message });
    }
  };
};
