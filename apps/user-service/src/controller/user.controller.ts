import { NextFunction, Response } from "express";
import prisma from "@packages/libs/prisma";
import {
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import bcrypt from "bcryptjs";

//get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

//update user password
export const updateUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ValidationError("all field are required"));
    }

    if (newPassword !== confirmPassword) {
      return next(new ValidationError("passwords do not match"));
    }

    if (currentPassword === newPassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the current password"
        )
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });
    if (!user || !user.password) {
      return next(new ValidationError("user not found or password not set"));
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return next(new ValidationError("current password is incorrect"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return res
      .status(200)
      .json({ success: true, message: "password updated successfully" });
  } catch (error) {
    next(error);
  }
};

//add new address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const { label, name, street, city, zip, country, isDefault } = req.body;

    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError("All fields are required"));
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
      },
    });

    res.status(201).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    next(error);
  }
};

//Delete user address
export const deleteAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!addressId) {
      return next(new ValidationError("Address ID is required"));
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!existingAddress) {
      return next(new NotFoundError("Address not found or unauthorized"));
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

//get user address
export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const address = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};
