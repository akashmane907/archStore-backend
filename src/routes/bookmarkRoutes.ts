import { Router } from 'express'
import { toggleBookmark, getBookmarkedPosts } from '../controllers/bookmarkController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

router.post('/:postId', verifyToken, toggleBookmark)
router.get('/', verifyToken, getBookmarkedPosts)

export default router
