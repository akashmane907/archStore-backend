import { Request, Response } from 'express';
import pool from '../config/db';

// Toggle Like
export const toggleLike = async (req: any, res: Response) => {
  const { postId } = req.params;
  const userId = req.user?.userId;

  if (!postId || !userId) {
    return res.status(400).json({ error: 'Invalid post ID or user ID' });
  }

  try {
    const existing = await pool.query(
      `SELECT * FROM likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (existing.rowCount > 0) {
      // Unlike
      await pool.query(
        `DELETE FROM likes WHERE post_id = $1 AND user_id = $2`,
        [postId, userId]
      );
      return res.json({ message: 'Post unliked' });
    } else {
      // Like
      await pool.query(
        `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`,
        [postId, userId]
      );

      // Get post owner
      const postOwnerRes = await pool.query(
        `SELECT user_id FROM posts WHERE id = $1`,
        [postId]
      );

      const recipientId = postOwnerRes.rows[0]?.user_id;

      if (recipientId && recipientId !== userId) {
        console.log('Sending like notification:', { recipientId, senderId: userId, postId });
        await createNotification({
          recipientId,
          senderId: userId,
          type: 'like',
          postId
        });
      }

      return res.json({ message: 'Post liked' });
    }
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

// Add Comment
export const addComment = async (req: any, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user?.userId;

  if (!postId || !content || !userId) {
    return res.status(400).json({ error: 'Missing post ID, comment content or user ID' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [postId, userId, content]
    );

    const postOwnerRes = await pool.query(
      `SELECT user_id FROM posts WHERE id = $1`,
      [postId]
    );

    const recipientId = postOwnerRes.rows[0]?.user_id;

    if (recipientId && recipientId !== userId) {
      console.log('Sending comment notification:', { recipientId, senderId: userId, postId });
      await createNotification({
        recipientId,
        senderId: userId,
        type: 'comment',
        postId
      });
    }

    res.status(201).json({ comment: result.rows[0] });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get Likes Count
export const getLikesCount = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM likes WHERE post_id = $1`,
      [postId]
    );

    res.json({ postId, likes: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Error fetching like count:', err);
    res.status(500).json({ error: 'Failed to get likes count' });
  }
};

// Get Comments
export const getComments = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const result = await pool.query(
      `SELECT comments.*, users.username, users.profile_picture
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.post_id = $1
       ORDER BY comments.created_at ASC`,
      [postId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to get comments' });
  }
};

//notification logic
export const createNotification = async ({
  recipientId,
  senderId,
  type,
  postId
}: {
  
  recipientId: string;
  senderId: string;
  type: 'follow' | 'like' | 'comment' | 'mention';
  postId?: string;
}) => {
  try {
    if (!recipientId || !senderId || !type) {
      throw new Error('Missing required fields for notification');
    }
     
    console.log('[NOTIFICATION] Creating:', { recipientId, senderId, type, postId });
    await pool.query(
      `INSERT INTO notifications (recipient_id, sender_id, type, post_id)
       VALUES ($1, $2, $3, $4)`,
      [recipientId, senderId, type, postId || null]
    );

    console.log('Notification created:', { recipientId, senderId, type, postId });
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};
