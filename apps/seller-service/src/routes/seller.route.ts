import express, { Router } from "express";
import { isSeller } from "@packages/middleware/authorizeRoles";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import {markNotificationAsRead, sellerNotifications, updateShop} from "../controller/seller.controller";

const router: Router = express.Router();

router.get("/get-notifications", isAuthenticated, isSeller, sellerNotifications)
router.post(
  "/mark-notification-as-read",
  isAuthenticated,
  isSeller,
  markNotificationAsRead,
);
router.put("/update-shop", isAuthenticated, isSeller, updateShop);

export default router;
