import mongoose, { Schema } from "mongoose";

const subTaskSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    c: {
      type: Boolean,
      default: false,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "tasks",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps },
);

const subTaskModel = mongoose.model("subtasks", subTaskSchema);

export default subTaskModel;
