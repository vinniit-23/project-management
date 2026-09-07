import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

/*
const healthCheck = (req,res,next) => {
  try {
    res.status(200).json(new ApiResponse(200, {message:"server is running"}))
  } catch (err) {
    next(err)
  }
}
*/

const healthCheck = asyncHandler(async (req, res) => {


  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      server: "running",
    },
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
  };
  res.status(200).json(new ApiResponse(200, healthData));
});

export { healthCheck };
