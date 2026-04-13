import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { StatusCodes } from "http-status-codes";

import { AppError } from "../utils/app-error";

export const validateRequest =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      next(new AppError("Validation failed", StatusCodes.BAD_REQUEST, result.error.flatten()));
      return;
    }

    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params as Request["params"];
    next();
  };
