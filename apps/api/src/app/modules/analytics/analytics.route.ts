import express from 'express'
import Auth from '../../middlewares/Auth'
import { requireWorkspaceMember } from '../../middlewares/workspace'
import { analyticsController } from './analytics.controller'

const router = express.Router()

router.use(Auth())
router.use(requireWorkspaceMember)

router.get('/dashboard', analyticsController.dashboard)

export const analyticsRouter = router
