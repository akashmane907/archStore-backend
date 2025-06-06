import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string

interface AuthRequest extends Request {
  user?: { userId: string; isAdmin: boolean }
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1] 

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; isAdmin: boolean }
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
