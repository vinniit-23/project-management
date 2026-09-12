import { body } from "express-validator";

const userValidation = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid Email format"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("username length must be greater than 3"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Pasword can't be empty")
      .isLength({ min: 6 })
      .withMessage("Password must be have more than 6 digits or letters"),
  ];
};

const loginValidation = () => {
  return [
    body("email")
      .trim()
      .optional()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("Email format is not valid"),
    body("username")
      .trim()
      .optional()
      .notEmpty()
      .withMessage("username is required")
      .isLength({ min: 3 })
      .withMessage("username must have have length greater than 3"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 6 })
      .withMessage("password must have have length greater than 6"),
  ];
};

const forgetPasswordValidation = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required for forget password")
      .isEmail()
      .withMessage("Email format is not correct"),
  ];
};

const resetPasswordValidation = () => {
  return [
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("new password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be have more than 6 digits or letters"),
    body("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("confirm password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be have more than 6 digits or letters"),
  ];
};

const changePasswordValidation = () => {
  return [
    body("oldPassword")
      .trim()
      .notEmpty()
      .withMessage("old password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be have more than 6 digits or letters"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("new password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be have more than 6 digits or letters"),
  ];
};

export {
  userValidation,
  loginValidation,
  forgetPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
};
