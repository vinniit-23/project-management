import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw new ApiError(422, "Invalid data", result.array);
  }
  return next();
};

export { validate };
