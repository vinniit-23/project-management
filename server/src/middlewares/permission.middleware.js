import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import projectModel from "../models/projects.models.js";
import projectMemberModel from "../models/projectmembers.models.js";
import mongoose from "mongoose";

const roleBaseAccessController = (role = []) => {
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "Project Id is missing");
    }

    const project = await projectModel.findById(
      new mongoose.Types.ObjectId(projectId),
    );

    if (!project) {
      throw new ApiError(404, "project not found");
    }

    const projectMember = await projectMemberModel.find({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user?._id),
    });

    if (!projectMember) {
      throw new ApiError(404, "project member not found");
    }

    const savedUserRole = projectMember.role;

    if (!role.includes(savedUserRole)) {
      throw new ApiError(
        403,
        "User doesn't have permission to do this operation",
      );
    }

    return next();
  });
};

export default roleBaseAccessController;
