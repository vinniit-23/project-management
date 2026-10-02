import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import taskModel from "../models/tasks.models.js";
import subTaskModel from "../models/subtask.models.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import mongoose from "mongoose";
import userModel from "../models/users.model.js";
import projectModel from "../models/projects.models.js";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "project id is missing");
  }
  const project = await projectModel.findById(
    new mongoose.Types.ObjectId(projectId),
  );

  if (!project) {
    throw new ApiError(404, "project not found");
  }

  const task = await taskModel
    .find({
      Project: new mongoose.Types.ObjectId(projectId),
    })
    .populate("assignedTo", "avatar username fullName");

  if (!task) {
    throw new ApiError(404, "project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "task fetched successfully"));
});

const createTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "project id is missing");
  }

  const { title, description, assignedTo, taskStatus } = req.body;

  const project = await projectModel.findById(
    new mongoose.Types.ObjectId(projectId),
  );

  if (!project) {
    throw new ApiError(404, "project not found");
  }

  const files = req.files || [];

  // this attachment is surely have problem
  const attachments = files.map((file) => {
    url: `${process.env.SERVER_URL}/image`;
    mimeType: file.mimeType;
    size: file.fileSize;
  });

  const task = await taskModel.create({
    title: title,
    description: description,
    assignedTo: assignedTo,
    taskStatus: taskStatus,
    assignedBy: new mongoose.Types.ObjectId(req.user?._id),
    Project: new mongoose.Types.ObjectId(projectId),
    attachments: attachments,
  });

  if (!task) {
    throw new ApiError(
      500,
      "internal server error, something went wrong during task creation",
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, task, "task created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    throw new ApiError(400, "taskId is required");
  }

  const task = await taskModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              assignedTo: {
                _id: 0,
                username: 1,
                fullname: 1,
                avatar: 1,
              },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    createdBy: {
                      _id: 0,
                      username: 1,
                      fullname: 1,
                      avatar: 1,
                    },
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);

  return res.status(200).json(200, task, "task fetched successfully");
});

const updateTask = asyncHandler(async (req, res) => {});

const deleteTask = asyncHandler(async (req, res) => {});

const createSubTask = asyncHandler(async (req, res) => {});

const updateSubTask = asyncHandler(async (req, res) => {});

const deleteSubTask = asyncHandler(async (req, res) => {});

const getAllSubTask = asyncHandler(async (req, res) => {});

const getSubTaskById = asyncHandler(async (req, res) => {});

export {
  getTasks,
  createTasks,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
  getAllSubTask,
  getSubTaskById,
};
