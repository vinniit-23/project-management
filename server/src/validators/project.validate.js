import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants.js";

const validateProject = () => {
  return [
    body("title").notEmpty().withMessage("project Title is required").trim(),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("if you writing description then wrote complete"),
  ];
};

const validateProjectMembers = () => {
  return [
    body("role")
      .notEmpty()
      .withMessage("role is required")
      .isIn(AvailableUserRole)
      .withMessage("user role is invalid"),
  ];
};

export { validateProject, validateProjectMembers };
