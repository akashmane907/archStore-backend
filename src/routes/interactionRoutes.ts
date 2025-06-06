import { Router } from 'express'
import {
  toggleLike,
  getLikesCount,
  addComment,
  getComments
} from '../controllers/interactionController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

// Likes
router.post('/like/:postId', verifyToken, toggleLike)
router.get('/like/:postId', getLikesCount)

// Comments
router.post('/comment/:postId', verifyToken, addComment)
router.get('/comment/:postId', getComments)

export default router
