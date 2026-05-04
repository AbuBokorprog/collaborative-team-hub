import express from 'express'
import Auth from '../../middlewares/Auth'
import ValidationRequest from '../../utils/ValidationRequest'
import {
  requireWorkspaceAdmin,
  requireWorkspaceMember,
} from '../../middlewares/workspace'
import { announcementController } from './announcement.controller'
import { announcementValidation } from './announcement.validation'

const router = express.Router()

router.use(Auth())
router.use(requireWorkspaceMember)

router.get('/', announcementController.list)

router.post(
  '/',
  requireWorkspaceAdmin,
  ValidationRequest(announcementValidation.createSchema),
  announcementController.create,
)

router.patch(
  '/:id',
  ValidationRequest(announcementValidation.updateSchema),
  announcementController.update,
)

router.delete('/:id', announcementController.remove)

router.post(
  '/:id/react',
  ValidationRequest(announcementValidation.reactSchema),
  announcementController.react,
)

router.post(
  '/:id/comment',
  ValidationRequest(announcementValidation.commentSchema),
  announcementController.comment,
)

router.patch(
  '/:id/comments/:cId',
  ValidationRequest(announcementValidation.commentSchema),
  announcementController.editComment,
)

router.delete('/:id/comments/:cId', announcementController.deleteComment)

router.post(
  '/:id/comments/:cId/replies',
  ValidationRequest(announcementValidation.commentSchema),
  announcementController.replyToComment,
)

router.post('/:id/pin', requireWorkspaceAdmin, announcementController.pin)

export const announcementRouter = router
