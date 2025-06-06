import { Request, Response } from 'express'
import pool from '../config/db'

export const createPost = async (req: any, res: Response) => {
  const { content, media_url } = req.body

  try {
    const postResult = await pool.query(
      `INSERT INTO posts (user_id, content, media_url) VALUES ($1, $2, $3) RETURNING *`,
      [req.user.userId, content, media_url]
    )

    const post = postResult.rows[0]
    const postId = post.id


    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || []

    for (const tag of hashtags) {
      const name = tag.toLowerCase()

     
      const hashtagRes = await pool.query(
        `INSERT INTO hashtags (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [name]
      )

     
      await pool.query(
        `INSERT INTO post_hashtags (post_id, hashtag_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [postId, hashtagRes.rows[0].id]
      )
    }

    res.status(201).json({ post })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create post' })
  }
}






export const getAllPosts = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.username, users.profile_picture
       FROM posts
       JOIN users ON posts.user_id = users.id
       ORDER BY posts.created_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
}

export const getUserPosts = async (req: Request, res: Response) => {
  const { username } = req.params
  try {
    const result = await pool.query(
      `SELECT posts.*, users.username, users.profile_picture
       FROM posts
       JOIN users ON posts.user_id = users.id
       WHERE users.username = $1
       ORDER BY posts.created_at DESC`,
      [username]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch user posts' })
  }
}

export const getPostsByHashtag = async (req: Request, res: Response) => {
  const { tag } = req.params
  try {
    const result = await pool.query(
      `SELECT p.*, u.username, u.profile_picture
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN post_hashtags ph ON p.id = ph.post_id
       JOIN hashtags h ON ph.hashtag_id = h.id
       WHERE h.name = $1
       ORDER BY p.created_at DESC`,
      [`#${tag.toLowerCase()}`] 
    )

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch posts by hashtag' })
  }
}


export const deletePost = async (req: any, res: Response) => {
  const { postId } = req.params
  try {
    const result = await pool.query(
      `DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *`,
      [postId, req.user.userId]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' })
    }
    res.json({ message: 'Post deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete post' })
  }
}
