import mongoose, { Schema } from "mongoose";
import { TaskStatusEnum } from "../utils/constants.js";
import { AvailableTaskStatus } from "../utils/constants.js";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    Project: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    taskStatus: {
      type: String,
      enum: AvailableTaskStatus,
      default: TaskStatusEnum.TODO,
    },
    attachments: {
      type: {
        url: String,
        mimeType: String,
        size: Number,
      },
    },
  },
  { timestamps: true },
);

const taskModel = mongoose.model("tasks", taskSchema);

export default taskModel;
