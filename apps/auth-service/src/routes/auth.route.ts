import express, { Router } from "express";
import {
  createShop,
  createStripeConnectLink,
  getLayoutData,
  getSeller,
  loginAdmin,
  loginSeller,
  loginUser,
  loginWithGoogle,
  logout,
  refreshToken,
  registerSeller,
  resetSellerPassword,
  resetUserPassword,
  sellerForgotPassword,
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
router.post("/login-google", loginWithGoogle);
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
router.post("/forgot-password-seller", sellerForgotPassword);
router.post("/reset-password-seller", resetSellerPassword);
router.post("/verify-forgot-password-seller", verifyForgotPassword);
//shop
router.post("/create-shop", isAuthenticated, isSeller, createShop);
router.post("/create-stripe-link", isAuthenticated, isSeller, createStripeConnectLink);

router.post("/login-admin", loginAdmin);
//layout
router.get("/get-layouts", getLayoutData)


export default router;
