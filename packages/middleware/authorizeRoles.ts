import { NextFunction, Response } from "express";
import { AuthenticationError } from "@packages/error-handler";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    return next(new AuthenticationError("Access denied: Seller only"));
  }
  next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new AuthenticationError("Access denied: User only"));
  }
  next();
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "admin") {
    return next(new AuthenticationError("Access denied: Admin only"));
  }
  next();
};
