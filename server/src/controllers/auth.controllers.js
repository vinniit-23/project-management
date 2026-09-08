import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import userModel from "../models/users.model.js";
import { emailVerificationContent, sendMail } from "../utils/mail.js";

const getRefreshAndAccessToken = async (userID) => {
  try {
    const user = await userModel.findById({ userID });

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
    await user.generateTemporaryToken();

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

export { registerUser };
