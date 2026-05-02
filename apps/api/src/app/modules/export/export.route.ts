import express from 'express'
import Auth from '../../middlewares/Auth'
import { requireWorkspaceMember } from '../../middlewares/workspace'
import { exportController } from './export.controller'

const router = express.Router()

router.use(Auth())
router.use(requireWorkspaceMember)

router.get('/csv', exportController.csv)

export const exportRouter = router
