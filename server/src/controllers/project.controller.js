import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import projectModel from "../models/projects.models.js";
import projectMemberModel from "../models/projectmembers.models.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import mongoose from "mongoose";
import userModel from "../models/users.model.js";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectMemberModel.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectMembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectMembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$projects",
    },
    {
      $project: {
        project: {
          _id: 1,
          title: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          createdBy: 1,
        },
        role: 1,
      },
    },
  ]);

  if (!projects) {
    throw new ApiError(
      "500",
      "Internal server error, couldn't find user projects",
    );
  }

  return new res.status(200).json(
    new ApiResponse(200, projects, "Projects feteched successfully"),
  );
});

const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "title and description are required");
  }

  const project = await projectModel.create({
    title: title,
    description: description,
    createdBy: req.user._id,
  });
  if (!project) {
    throw new ApiError(500, "Internal server error, project isn't created");
  }

  const projectMember = await projectMemberModel.create({
    project: project._id,
    user: req.user._id,
    role: UserRolesEnum.ADMIN,
  });
  if (!projectMember) {
    throw new ApiError(
      500,
      "Internal server error, problem occurr during project member assignment",
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "ProjectID is missing from the params");
  }

  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "title and description are required");
  }

  const updated_project = await projectModel.findByIdAndUpdate(
    projectId,
    {
      $set: {
        title: title,
        description: description,
      },
    },
    { new: true },
  );

  if (!updated_project) {
    throw new ApiError(
      500,
      "Internal server error, something went wrong during updation of project",
    );
  }

  return res
    .status(204)
    .json(
      new ApiResponse(204, updated_project, "project updated successfully"),
    );
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "Project Id is required");
  }

  const deleted_project = await projectModel.findByIdAndDelete(projectId);
  if (!deleted_project) {
    throw new ApiError(
      500,
      "Internal server error, Project is unable to delete",
    );
  }

  return res.status(204).json(204, {}, "Project deleted successfully");
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "projectId is missing");
  }

  const project = await projectModel.findById(projectId);

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const addMembersToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { projectId } = req.params;

  if (!email || !role) {
    throw new ApiError(400, "email and role is required");
  }

  if (!projectId) {
    throw new ApiError(400, "projectId is missing");
  }

  if (!AvailableUserRole.includes(role)) {
    throw new ApiError(400, "Invalid user role");
  }

  const project = await projectModel.findById(projectId);
  if (!project) {
    throw new ApiError(404, "project not found");
  }

  const user = await userModel.findOne({
    email: email,
  });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const memberExist = await projectMemberModel.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(user._id),
  });

  if (memberExist) {
    throw new ApiError(409, "Member already exists");
  }

  const projectMemberAdded = await projectMemberModel.create({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(user._id),
    role: role,
  });

  if (!projectMemberAdded) {
    throw new ApiError(
      500,
      "Internal server error, Something went wrong during addtion of new member",
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, projectMemberAdded, "New member added successfully"),
    );
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "projectId is missing");
  }

  // const projectMembers = await projectMemberModel.aggregate([
  //   {
  //     $match: {
  //       project: new mongoose.Types.ObjectId(projectId),
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: user,
  //       foreignField: "_id",
  //       as: "user",
  //       pipeline: [
  //         {
  //           $project: {
  //             _id: 1,
  //             username: 1,
  //             fullname: 1,
  //             email: 1,
  //             avatar: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $addFields: {
  //       user: {
  //         $arrayElemAt: ["user", 0],
  //       },
  //     },
  //   },
  //   {
  //     $project: {
  //       project: 1,
  //       user: 1,
  //       role: 1,
  //       createdAt: 1,
  //       updatedAt: 1,
  //       _id: 0,
  //     },
  //   },
  // ]);

  // or

  const projectMembers = await projectMemberModel
    .find({
      project: new mongoose.Types.ObjectId(projectId),
    })
    .populate({
      path: "user",
      select: "avatar fullname username _id email",
    })
    .select("project user role createdAt updatedAt")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMembers,
        "Project members fetched successfully",
      ),
    );
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { projectId, userId } = req.params;

  if (!projectId || !userId) {
    throw new ApiError(400, "projectId and userId is required");
  }

  const projectExists = await projectModel.findById(
    new mongoose.Types.ObjectId(projectId),
  );

  if (!projectExists) {
    throw new ApiError(404, "project not found");
  }

  const userExists = await userModel.findById(
    new mongoose.Types.ObjectId(userId),
  );

  if (!userExists) {
    throw new ApiError(404, "user not found");
  }

  const projectMember = await projectMemberModel.findOne({
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(404, "project member not found");
  }

  projectMember = await projectMemberModel.findByIdAndUpdate(
    projectMember._id,
    {
      $set: { role: role },
    },
    { new: true },
  );

  if (!projectMember) {
    throw new ApiError(
      500,
      "Internal server error , something went wrong during updation of member role",
    );
  }

  return res
    .status(204)
    .json(204, projectMember, "Memeber role updated successfully");
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  if (!projectId || !userId) {
    throw new ApiError(400, "projectId and userId is required");
  }

  const projectExists = await projectModel.findById(
    new mongoose.Types.ObjectId(projectId),
  );

  if (!projectExists) {
    throw new ApiError(404, "project not found");
  }

  const userExists = await userModel.findById(
    new mongoose.Types.ObjectId(userId),
  );

  if (!userExists) {
    throw new ApiError(404, "user not found");
  }

  const projectMember = await projectMemberModel.findOne({
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(404, "project member not found");
  }

  projectMember = await projectMemberModel.findByIdAndDelete(projectMember._id);

  if (!projectMember) {
    throw new ApiError(
      500,
      "Internal server error , something went wrong during updation of member role",
    );
  }

  return res
    .status(204)
    .json(204, projectMember, "Memeber role deleted successfully");
});

export {
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
  deleteMember,
  deleteProject,
  createProject,
  addMembersToProject,
};
