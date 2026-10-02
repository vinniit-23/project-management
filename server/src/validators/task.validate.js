import { body } from "express-validator";
import { AvailableTaskStatus } from "../utils/constants.js";

const validateTask = () => {
  return [
    body("title").notEmpty().withMessage("project Title is required").trim(),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("if you writing description then wrote complete"),
    body("taskStatus")
      .notEmpty()
      .withMessage("task status is required")
      .isIn(AvailableTaskStatus)
      .withMessage("task status is invalid"),
  ];
};

const validateSubTask = () => {
  return [
    body("title").notEmpty().withMessage("project Title is required").trim(),
    body("isCompleted")
      .notEmpty()
      .withMessage("isCompleted can't be empty")
      .toBoolean()
      .withMessage("isComplete must be boolean value"),
  ];
};

export { validateTask, validateSubTask };
