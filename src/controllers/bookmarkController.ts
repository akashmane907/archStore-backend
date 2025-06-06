import { Request, Response } from 'express'
import pool from '../config/db'

// Toggle Bookmark
export const toggleBookmark = async (req: any, res: Response) => {
  const { postId } = req.params
  const userId = req.user.userId

  try {
    const existing = await pool.query(
      `SELECT * FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    )

    if (existing.rowCount > 0) {
      await pool.query(`DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2`, [userId, postId])
      return res.json({ message: 'Post removed from bookmarks' })
    } else {
      await pool.query(`INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)`, [userId, postId])
      return res.json({ message: 'Post bookmarked' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to toggle bookmark' })
  }
}

// Get all bookmarked posts
export const getBookmarkedPosts = async (req: any, res: Response) => {
  const userId = req.user.userId
  try {
    const result = await pool.query(
      `SELECT posts.*, users.username
       FROM bookmarks
       JOIN posts ON bookmarks.post_id = posts.id
       JOIN users ON posts.user_id = users.id
       WHERE bookmarks.user_id = $1
       ORDER BY bookmarks.created_at DESC`,
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get bookmarked posts' })
  }
}
