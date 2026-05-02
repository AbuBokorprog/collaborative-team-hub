import express from 'express'
import Auth from '../../middlewares/Auth'
import { requireWorkspaceMember } from '../../middlewares/workspace'
import ValidationRequest from '../../utils/ValidationRequest'
import { auditController } from './audit.controller'
import { auditValidation } from './audit.validation'

const router = express.Router()

router.use(Auth())
router.use(requireWorkspaceMember)

router.get('/', ValidationRequest(auditValidation.listQuery), auditController.list)

export const auditRouter = router
