import express from 'express'
import Auth from '../../middlewares/Auth'
import ValidationRequest from '../../utils/ValidationRequest'
import {
  requireWorkspaceAdmin,
  requireWorkspaceMemberFromParams,
} from '../../middlewares/workspace'
import { workspaceController } from './workspace.controller'
import { workspaceValidation } from './workspace.validation'
import { workspaceNestedRouter } from './workspace.nested'

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

router.post(
  '/:id/members/invite',
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

router.get(
  '/:id/stats',
  requireWorkspaceMemberFromParams,
  workspaceController.stats,
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

router.use('/:workspaceId', workspaceNestedRouter)

export const workspaceRouter = router
