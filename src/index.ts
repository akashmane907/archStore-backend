import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import postRoutes from './routes/postRoutes'
import bookmarkRoutes from './routes/bookmarkRoutes'
import notificationRoutes from './routes/notificationRoutes'
import messagesRoutes from './routes/messagesRoutes'


import interactionRoutes from './routes/interactionRoutes'


import './config/db' 

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/interactions', interactionRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/messages', messagesRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
