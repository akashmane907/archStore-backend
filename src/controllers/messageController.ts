import { Request, Response } from 'express';
import pool from '../config/db';


export const sendMessage = async (req: any, res: Response) => {
  const { recipientId, content } = req.body;
  const senderId = req.user?.userId;

  if (!recipientId || !content || !senderId) {
    return res.status(400).json({ error: 'Recipient ID and content are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [senderId, recipientId, content]
    );

    // 🔔 Trigger notification
    if (recipientId !== senderId) {
      await createNotification({
        recipientId,
        senderId,
        type: 'message',
      });
    }

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};



export const getMessages = async (req: any, res: Response) => {
  const userId = req.user?.userId;
  const { otherUserId } = req.params;

  if (!userId || !otherUserId) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND recipient_id = $2)
          OR (sender_id = $2 AND recipient_id = $1)
       ORDER BY created_at ASC`,
      [userId, otherUserId]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const markMessageAsRead = async (req: any, res: Response) => {
  const userId = req.user?.userId;
  const { messageId } = req.params;

  if (!messageId || !userId) {
    return res.status(400).json({ error: 'Invalid message ID or user ID' });
  }

  try {
    await pool.query(
      `UPDATE messages SET is_read = true WHERE id = $1 AND recipient_id = $2`,
      [messageId, userId]
    );

    res.json({ message: 'Message marked as read' });
  } catch (err) {
    console.error('Error updating message:', err);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

export const createNotification = async ({
  recipientId,
  senderId,
  type,
  postId
}: {
  recipientId: string;
  senderId: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'message';
  postId?: string;
}) => {
  try {
    if (!recipientId || !senderId || !type) {
      throw new Error('Missing fields for notification');
    }

    await pool.query(
      `INSERT INTO notifications (recipient_id, sender_id, type, post_id)
       VALUES ($1, $2, $3, $4)`,
      [recipientId, senderId, type, postId || null]
    );

    console.log(`[Notification] Sent "${type}" from ${senderId} to ${recipientId}`);
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};
