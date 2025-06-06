import { Router } from 'express'
import {
  createPost,
  getAllPosts,
  getUserPosts,
  getPostsByHashtag,
  deletePost
} from '../controllers/postController'
 
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

router.post('/', verifyToken, createPost)
router.get('/', getAllPosts)
router.get('/user/:username', getUserPosts)
router.delete('/:postId', verifyToken, deletePost)
router.get('/hashtag/:tag', getPostsByHashtag)


export default router
