import express, { Router } from "express";
import {
  createShop,
  createStripeConnectLink,
  getLayoutData,
  getSeller,
  loginAdmin,
  loginSeller,
  loginUser,
  logout,
  refreshToken,
  registerSeller,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyForgotPassword,
  verifySeller,
  verifyUser,
} from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-password-user", resetUserPassword);
router.post("/verify-forgot-password-user", verifyForgotPassword);
//Seller
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);
//shop
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectLink);

router.post("/login-admin", loginAdmin);
//layout
router.get("/get-layouts", getLayoutData)


export default router;
