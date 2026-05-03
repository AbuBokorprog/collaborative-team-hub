import express from 'express'
import Auth from '../../middlewares/Auth'
import ValidationRequest from '../../utils/ValidationRequest'
import { requireWorkspaceMember } from '../../middlewares/workspace'
import { goalController } from './goal.controller'
import { goalValidation } from './goal.validation'

const router = express.Router()

router.use(Auth())
router.use(requireWorkspaceMember)
router.get('/', goalController.list)
router.post(
  '/',
  ValidationRequest(goalValidation.createBody),
  goalController.create,
)
router.get('/:id/activity', goalController.activity)
router.post(
  '/:id/updates',
  ValidationRequest(goalValidation.updateCreate),
  goalController.addUpdate,
)
router.post(
  '/:id/milestones',
  ValidationRequest(goalValidation.milestoneCreate),
  goalController.createMilestone,
)
router.get('/:id', goalController.getOne)
router.get('/:id/analytics', goalController.analytics)
router.patch(
  '/:id',
  ValidationRequest(goalValidation.updateBody),
  goalController.update,
)
router.delete('/:id', goalController.remove)

export const goalRouter = router
