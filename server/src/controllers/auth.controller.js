import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import userModel from "../models/users.model.js";
import {
  emailVerificationContent,
  sendMail,
  passwordResetContent,
} from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const getRefreshAndAccessToken = async (userID) => {
  try {
    const user = await userModel.findById(userID);
    console.log("👋User ", user);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (e) {
    throw new ApiError(
      500,
      "Something went wrong during database operation.",
      [],
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const userExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (userExists) {
    throw new ApiError(409, "User already exsits");
  }

  const user = await userModel.create({
    username,
    email,
    password,
    isEmailVerified: false,
  });

  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendMail({
    email: user?.email,
    subject: "Email verification",
    mailgenContent: emailVerificationContent(
      user?.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-user/${unhashedToken}`,
    ),
  });

  const createdUser = await userModel
    .findById(user._id)
    .select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

  if (!createdUser) {
    throw new ApiError(500, "Something went during user creation");
  }

  console.log(createdUser);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User created successfully and verification email is sent to your email.",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  console.log("😎username ", username);
  console.log("🫡email ", email);
  console.log("🥳password ", password);

  if (!username && !email) {
    throw new ApiError(400, "username or email required");
  }

  const user = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(401, "User is not authenticated", []);
  }

  const isPasswordValid = await user.checkPassword(password);
  console.log("🔥password validation ", isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is invalid", []);
  }

  const loggedUser = await userModel
    .findById(user._id)
    .select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

  const { accessToken, refreshToken } = await getRefreshAndAccessToken(
    loggedUser?._id,
  );
  console.log("👀Access Token ", accessToken);
  console.log("🐮Refresh Token ", refreshToken);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedUser, accessToken, refreshToken },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: { refreshToken: "" },
    },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "Email Verification token is missing");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await userModel.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user?._id);

  if (!user) {
    throw new ApiError(401, "UnAuthorised user", []);
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified");
  }

  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendMail({
    email: user?.email,
    subject: "Email verification",
    mailgenContent: emailVerificationContent(
      user?.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-user/${unhashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email sended successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  console.log("incomingRefreshToken ", incomingRefreshToken);
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauhorized Error");
  }

  try {
    const decode = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESHTOKEN_SECRET,
    );

    const user = await userModel
      .findById(decode._id)
      .select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
      );

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    const { accessToken, refreshToken } = getRefreshAndAccessToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
          "Updated refresh and access Token",
        ),
      );
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required for forget password");
  }

  const user = await userModel.findOne({ email: email });

  if (!user) {
    throw new ApiError(400, "Invalid email");
  }

  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgetPasswordToken = hashedToken;
  user.forgetPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendMail({
    email: user?.email,
    subject: "forget password Email",
    mailgenContent: passwordResetContent(
      user?.username,
      `${process.env.FORGET_PASSWORD_REDIRECT_URL}/${unhashedToken}`,
    ),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Forget password email is send"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!resetToken) {
    throw new ApiError(400, "reset Token can't be empty");
  }

  if (!newPassword || !confirmPassword) {
    throw new ApiError(400, "new password and confirm password is required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(
      401,
      "both new password and confirm password should be same",
    );
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await userModel.findOne({
    forgetPasswordToken: hashedToken,
    forgetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(401, "Invalid reset token");
  }

  user.password = newPassword;
  user.forgetPasswordExpiry = undefined;
  user.forgetPasswordToken = undefined;
  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "old password and new password both are required");
  }

  const user = await userModel.findById(req.user._id);

  if (!user) {
    throw new ApiError(401, "Invalid user");
  }

  const isPasswordValid = await user.checkPassword(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail,
  refreshAccessToken,
  forgetPassword,
  resetPassword,
  changePassword,
};
