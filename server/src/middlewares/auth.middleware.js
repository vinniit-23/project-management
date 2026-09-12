import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";
import userModel from "../models/users.model.js";

const verifyJWT = async (req, res, next) => {
  const accessToken = req.cookies.accessToken || req.header("Authorization");

  console.log(req.header("Authorization"));
  console.log("Access Token ", accessToken);

  if (!accessToken) {
    throw new ApiError(401, "UnAuthorised user");
  }
  try {
    const decode = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);
    console.log("access Token decode ", decode);

    const user = await userModel.findById(decode?._id);

    req.user = user;
    console.log(req.user);

    return next();
  } catch (err) {
    throw new ApiError(401, "Unauthorised Error", []);
  }
};

export { verifyJWT };
