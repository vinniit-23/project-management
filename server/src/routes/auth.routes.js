import { Router } from "express";
import {
  changePasswordValidation,
  forgetPasswordValidation,
  loginValidation,
  resetPasswordValidation,
  userValidation,
} from "../validators/auth.validate.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  changePassword,
  forgetPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// unsecure routes
router.route("/register").post(userValidation(), validate, registerUser);
router.route("/login").post(loginValidation(), validate, loginUser);
router.route("/verify-email/:verificationToken").post(verifyEmail);
router
  .route("/forget-password")
  .post(forgetPasswordValidation(), validate, forgetPassword);
router
  .route("/reset-password/:resetToken")
  .post(resetPasswordValidation(), validate, resetPassword);

//Secure Routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/get-current-user").post(verifyJWT, getCurrentUser);
router.route("/refresh-tokens").post(verifyJWT, refreshAccessToken);
router
  .route("/resend-verification-email")
  .post(verifyJWT, resendVerificationEmail);
router
  .route("/change-password")
  .post(verifyJWT, changePasswordValidation(), validate, changePassword);

export default router;
