
import { Response } from 'express'
import pool from '../config/db'

export const toggleFollow = async (req: any, res: Response) => {
  const userIdToFollow = req.params.userId 
  const currentUserId = req.user?.userId;

    console.log('userIdToFollow:', userIdToFollow)
  console.log('currentUserId:', currentUserId)

  if (!userIdToFollow || !currentUserId) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (userIdToFollow === currentUserId) {
    return res.status(400).json({ error: "You can't follow yourself" });
  }

  try {
    const existing = await pool.query(
      `SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [currentUserId, userIdToFollow]
    );

    if (existing.rowCount > 0) {
      // Unfollow
      await pool.query(
        `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
        [currentUserId, userIdToFollow]
      );
      return res.json({ message: 'Unfollowed successfully' });
    } else {
      // Follow
      await pool.query(
        `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`,
        [currentUserId, userIdToFollow]
      );
  


      return res.json({ message: 'Followed successfully' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error processing follow action' });
  }
};



//get followers
export const getFollowers = async (req: any, res: Response) => {
  const currentUserId = req.user?.userId;
  console.log('getFollowers - currentUserId:', currentUserId);

  if (!currentUserId) {
    return res.status(401).json({ error: 'Unauthorized - user ID missing' });
  }

  try {
    const result = await pool.query(
      `SELECT users.id, users.username, users.profile_picture
       FROM follows
       JOIN users ON follows.follower_id = users.id
       WHERE follows.following_id = $1`,
      [currentUserId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error in getFollowers:', err);
    res.status(500).json({ error: 'Failed to get followers' });
  }
};





//get following
export const getFollowing = async (req: any, res: Response) => {
  const userId = req.user.userId
  try {
    const result = await pool.query(
      `SELECT users.id, users.username, users.profile_picture
       FROM follows
       JOIN users ON follows.following_id = users.id
       WHERE follows.follower_id = $1`,
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch following' })
  }
}

//notification logic
export const createNotification = async ({
  recipientId,
  senderId,
  type,
  postId
}: {
  recipientId: string
  senderId: string
  type: 'follow' | 'like' | 'comment' | 'mention'
  postId?: string
}) => {
  try {
    await pool.query(
      `INSERT INTO notifications (recipient_id, sender_id, type, post_id)
       VALUES ($1, $2, $3, $4)`,
      [recipientId, senderId, type, postId || null]
    )
  } catch (err) {
    console.error('Error creating notification:', err)
  }
}
