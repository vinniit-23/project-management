import  User  from "../models/users.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerificationMailGenContent, sendEmail } from "../utils/mail.js";
import { asyncHandler } from "../utils/async-handler.js";
import Mailgen from "mailgen";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something Went wrong while generating access and refresh token",[]
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with eamil and username is already exists",
      [],
    );
  }

  const user = await User.create({
    email,
    username,
    password,
  });

  const { unhashed, hashed, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashed;
  user.emailVerificationTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "please verify your email",
    mailgenContent: emailVerificationMailGenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/vi/users/verify-email/${unhashed}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry ",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the User",[]);
  }

  return res.status(201).json(
    new ApiResponse(
      200,
      {
        user: createdUser,
      },
      "User registered successfully and verification email has been sent on your email",
    ),
  );
});

export { registerUser };
