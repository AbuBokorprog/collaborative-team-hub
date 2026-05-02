import express from 'express'
import Auth from '../../middlewares/Auth'
import ValidationRequest from '../../utils/ValidationRequest'
import { notificationController } from './notification.controller'
import { notificationValidation } from './notification.validation'

const router = express.Router()

router.use(Auth())

router.get('/unread-count', notificationController.unreadCount)
router.get('/preferences', notificationController.getPreferences)
router.patch(
  '/preferences',
  ValidationRequest(notificationValidation.preferenceBody),
  notificationController.updatePreferences,
)
router.patch('/read-all', notificationController.readAll)
router.delete('/', notificationController.deleteRead)
router.get(
  '/',
  ValidationRequest(notificationValidation.listQuery),
  notificationController.list,
)
router.delete('/:id', notificationController.remove)
router.patch('/:id/read', notificationController.read)

export const notificationRouter = router
