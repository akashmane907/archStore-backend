import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../config/db'
import { registerSchema, loginSchema } from '../validators/authValidators'

const JWT_SECRET = process.env.JWT_SECRET as string

export const register = async (req: Request, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body)
  if (!parseResult.success) {
    const errors = parseResult.error.errors.map(e => e.message)
    return res.status(400).json({ errors })
  }

  const { name, username, email, password } = parseResult.data

  try {
    const existingUser = await pool.query(`SELECT 1 FROM users WHERE email = $1 OR username = $2`, [email, username])
    if (existingUser.rowCount > 0) {
      return res.status(409).json({ error: 'Email or username already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO users (name, username, email, password) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, username, email, is_admin`,
      [name, username, email, hashedPassword]
    )

    res.status(201).json({ user: result.rows[0] })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
}

export const login = async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body)
  if (!parseResult.success) {
    const errors = parseResult.error.errors.map(e => e.message)
    return res.status(400).json({ errors })
  }

  const { email, password } = parseResult.data

  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
    const user = result.rows[0]

    if (!user) return res.status(404).json({ error: 'User not found' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, JWT_SECRET, { expiresIn: '1d' })

    res.json({ token })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
}
