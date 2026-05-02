import express from 'express'
import Auth from '../../middlewares/Auth'
import ValidationRequest from '../../utils/ValidationRequest'
import { taskController } from './task.controller'
import { taskValidation } from './task.validation'

const router = express.Router()

router.use(Auth())

router.get('/', taskController.list)
router.post(
  '/',
  ValidationRequest(taskValidation.createBody),
  taskController.create,
)
router.get('/:id', taskController.getOne)
router.patch(
  '/:id',
  ValidationRequest(taskValidation.updateBody),
  taskController.update,
)
router.delete('/:id', taskController.remove)

export const taskRouter = router
