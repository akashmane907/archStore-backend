import { Request, Response } from 'express'
import pool from '../config/db'


export const getNotifications = async (req: any, res: Response) => {
  const userId = req.user.userId

  try {
    const result = await pool.query(
      `SELECT n.*, u.username AS sender_username, u.profile_picture
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    )

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
}

export const markNotificationAsRead = async (req: any, res: Response) => {
  const userId = req.user.userId
  const { id } = req.params

  try {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_id = $2 RETURNING *`,
      [id, userId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    res.json({ message: 'Notification marked as read' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update notification' })
  }
}
