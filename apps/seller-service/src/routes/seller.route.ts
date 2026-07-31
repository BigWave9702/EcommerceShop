import express, { Router } from "express";
import { isSeller } from "@packages/middleware/authorizeRoles";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import {markNotificationAsRead, sellerNotifications} from "../controller/seller.controller";

const router: Router = express.Router();

router.get("/get-notifications", isAuthenticated, isSeller, sellerNotifications)
router.get(
  "/mark-notification-as-read",
  isAuthenticated,
  markNotificationAsRead,
);

export default router;
