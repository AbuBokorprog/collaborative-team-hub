import express from 'express'
import Auth from '../../middlewares/Auth'
import ValidationRequest from '../../utils/ValidationRequest'
import {
  requireWorkspaceAdmin,
  requireWorkspaceMemberFromParams,
} from '../../middlewares/workspace'
import { workspaceController } from './workspace.controller'
import { workspaceValidation } from './workspace.validation'

const router = express.Router()

router.use(Auth())

router.get('/', workspaceController.list)
router.post(
  '/',
  ValidationRequest(workspaceValidation.createSchema),
  workspaceController.create,
)

router.get('/:id', requireWorkspaceMemberFromParams, workspaceController.getOne)

router.patch(
  '/:id',
  requireWorkspaceMemberFromParams,
  requireWorkspaceAdmin,
  ValidationRequest(workspaceValidation.updateSchema),
  workspaceController.update,
)

router.delete(
  '/:id',
  requireWorkspaceMemberFromParams,
  requireWorkspaceAdmin,
  workspaceController.remove,
)

router.post(
  '/:id/invite',
  requireWorkspaceMemberFromParams,
  requireWorkspaceAdmin,
  ValidationRequest(workspaceValidation.inviteSchema),
  workspaceController.invite,
)

router.get(
  '/:id/members',
  requireWorkspaceMemberFromParams,
  workspaceController.members,
)

router.patch(
  '/:id/members/:userId',
  requireWorkspaceMemberFromParams,
  requireWorkspaceAdmin,
  ValidationRequest(workspaceValidation.updateMemberSchema),
  workspaceController.updateMember,
)

router.delete(
  '/:id/members/:userId',
  requireWorkspaceMemberFromParams,
  requireWorkspaceAdmin,
  workspaceController.removeMember,
)

export const workspaceRouter = router
