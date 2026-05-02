import express from 'express'
import Auth from '../../middlewares/Auth'
import ValidationRequest from '../../utils/ValidationRequest'
import { requireWorkspaceMember } from '../../middlewares/workspace'
import { milestoneController } from './milestone.controller'
import { milestoneValidation } from './milestone.validation'

const router = express.Router()

router.use(Auth())
router.use(requireWorkspaceMember)

router.patch(
  '/:id',
  ValidationRequest(milestoneValidation.updateBody),
  milestoneController.update,
)
router.delete('/:id', milestoneController.remove)

export const milestoneRouter = router
