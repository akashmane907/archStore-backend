import { Router } from 'express'
import {
  getMyProfile,
  updateProfile,
  getUserByUsername,
  searchUsers
} from '../controllers/userController'

import { verifyToken } from '../middlewares/authMiddleware'

import {
  toggleFollow,
  getFollowers,
  getFollowing
} from '../controllers/followController'



const router = Router()




router.get('/me', verifyToken, getMyProfile)
router.put('/me', verifyToken, updateProfile)
router.get('/search', searchUsers)

router.post('/follow/:userId', verifyToken, toggleFollow)
router.get('/followers', verifyToken, getFollowers)
router.get('/following', verifyToken, getFollowing)


router.get('/:username', getUserByUsername)

export default router


export default router
