import express, { Router } from "express";
import {
  addUserAddress,
  deleteAddress,
  getUser,
  getUserAddresses,
  updateUserPassword,
} from "../controller/user.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/logged-in-user", isAuthenticated, getUser);
router.post("/change-password", isAuthenticated, updateUserPassword);
router.get("/shipping-addresses", isAuthenticated, getUserAddresses);
router.post("/add-address", isAuthenticated, addUserAddress);
router.delete("/delete-address/:addressId", isAuthenticated, deleteAddress);

export default router;
