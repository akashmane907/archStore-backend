import { Request, Response } from 'express'
import pool from '../config/db'

export const getMyProfile = async (req: any, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, username, email, profile_picture, is_admin, created_at FROM users WHERE id = $1`,
      [req.user.userId]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

export const updateProfile = async (req: any, res: Response) => {
  const { name, username, email, profile_picture } = req.body
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, username=$2, email=$3, profile_picture=$4 WHERE id=$5 RETURNING *`,
      [name, username, email, profile_picture, req.user.userId]
    )
    res.json({ user: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

export const getUserByUsername = async (req: Request, res: Response) => {
  const { username } = req.params
  try {
    const result = await pool.query(
      `SELECT id, name, username, profile_picture FROM users WHERE username = $1`,
      [username]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
}

export const searchUsers = async (req: Request, res: Response) => {
  const { q } = req.query
  try {
    const result = await pool.query(
      `SELECT id, name, username, profile_picture FROM users 
       WHERE name ILIKE $1 OR username ILIKE $1`,
      [`%${q}%`]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'User search failed' })
  }
}
