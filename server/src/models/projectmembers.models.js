import mongoose, { Schema } from "mongoose";
import { AvailableUserRole } from "../utils/constants.js";
import { UserRolesEnum } from "../utils/constants.js";

const projectMemberSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRole,
      default: UserRolesEnum.MEMBER,
    },
  },
  { timestamps: true },
);

projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

const projectMemberModel = mongoose.model(
  "projectmembers",
  projectMemberSchema,
);

export default projectMemberModel;
