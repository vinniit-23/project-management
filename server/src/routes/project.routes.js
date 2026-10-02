import { Router } from "express";
import {
  validateProject,
  validateProjectMembers,
} from "../validators/project.validate.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
  deleteMember,
  deleteProject,
  createProject,
  addMembersToProject,
} from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import roleBaseAccessController from "../middlewares/permission.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

// create and get all projects
router
  .route("/")
  .get(getProjects)
  .post(validateProject(), validate, createProject);

// get project by id, update project, delete project
router
  .route("/:projectId")
  .get(roleBaseAccessController(AvailableUserRole), getProjectById)
  .put(roleBaseAccessController, validateProject(), validate, updateProject)
  .delete(roleBaseAccessController(UserRolesEnum.ADMIN), deleteProject);

// get project members and add project members
router
  .route("/:projectId/members")
  .get(getProjectMembers)
  .post(
    roleBaseAccessController(UserRolesEnum.ADMIN),
    validateProjectMembers(),
    validate,
    addMembersToProject,
  );

router
  .route("/:projectId/members/:userId")
  .put(
    roleBaseAccessController(UserRolesEnum.ADMIN),
    validateProjectMembers(),
    validate,
    updateMemberRole,
  )
  .delete(roleBaseAccessController(UserRolesEnum.ADMIN), deleteMember);
export default router;
