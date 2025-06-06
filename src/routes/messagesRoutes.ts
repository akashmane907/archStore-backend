import express from 'express';
import { sendMessage, getMessages, markMessageAsRead } from '../controllers/messageController';
import { verifyToken } from '../middlewares/authMiddleware'


const router = express.Router();

router.post('/send', verifyToken, sendMessage);
router.get('/with/:otherUserId', verifyToken, getMessages);
router.patch('/read/:messageId', verifyToken, markMessageAsRead);

export default router;
