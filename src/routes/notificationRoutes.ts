import { Router } from 'express'
import {
  getNotifications,
  markNotificationAsRead
} from '../controllers/notificationController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

router.get('/', verifyToken, getNotifications)
router.put('/:id/read', verifyToken, markNotificationAsRead)

export default router
