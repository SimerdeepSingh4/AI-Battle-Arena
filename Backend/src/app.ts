import express from 'express'
import cors from 'cors'
import runGraph from "./ai/graph.ai.js"
import { authMiddleware } from './middleware/auth.middleware.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Battle Arena is online' })
})

app.post('/battle', authMiddleware, async (req, res) => {
  const { problem, modelA, modelB, judge } = req.body
  if (!problem || typeof problem !== 'string' || problem.trim() === '') {
    return res.status(400).json({ error: 'A problem statement is required.' })
  }
  try {
    const result = await runGraph(
      problem.trim(),
      typeof modelA === 'string' ? modelA : undefined,
      typeof modelB === 'string' ? modelB : undefined,
      typeof judge === 'string' ? judge : undefined
    )
    res.json(result)
  } catch (err: any) {
    console.error('Battle error:', err)
    res.status(500).json({ error: 'An error occurred while running the battle.' })
  }
})

export default app;