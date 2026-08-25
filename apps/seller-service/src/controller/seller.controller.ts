import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";

export const deleteShop = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {
    next(error);
  }
};

// update shop profile
export const updateShop = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller?.id;

    const {
      name,
      bio,
      category,
      address,
      opening_hours,
      website,
      socialLinks,
      coverBanner,
    } = req.body;

    const shop = await prisma.shops.findUnique({ where: { sellerId } });

    if (!shop) {
      return next(new ValidationError("Shop not found for this seller!"));
    }

    const updatedShop = await prisma.shops.update({
      where: { sellerId },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(category !== undefined && { category }),
        ...(address !== undefined && { address }),
        ...(opening_hours !== undefined && { opening_hours }),
        ...(website !== undefined && { website }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(coverBanner !== undefined && { coverBanner }),
      },
      include: { avatar: true },
    });

    res.status(200).json({
      success: true,
      shop: updatedShop,
    });
  } catch (error) {
    next(error);
  }
};

// restore shop
export const restoreShop = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller?.id;

    //find seller with shop
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });
  } catch (error) {
    next(error);
  }
};

// fetching notifications for sellers
export const sellerNotifications = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller.id;
    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: sellerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// mark notification as read
export const markNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { notificationId } = req.body;
    const sellerId = req.seller?.id;

    if (!notificationId) {
      return next(new ValidationError("Notification id is required!"));
    }

    const existingNotification = await prisma.notifications.findUnique({
      where: { id: notificationId },
      select: { id: true, receiverId: true },
    });

    if (!existingNotification || existingNotification.receiverId !== sellerId) {
      return next(new ValidationError("Notification not found or unauthorized"));
    }

    const notification = await prisma.notifications.update({
      where: { id: notificationId },
      data: { status: "Read" },
    });

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};
