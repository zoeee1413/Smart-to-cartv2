
import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const PORT = process.env.PORT || 3001

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.join(__dirname, 'dist')

app.use(express.json())

// Serve the Vite production frontend
app.use(express.static(distPath))

// Recipe generation API
app.post('/api/generate-recipe', async (req, res) => {
  const dish = String(req.body?.dish || '').trim().slice(0, 80)

  if (!dish) {
    return res.status(400).json({ error: 'Missing dish' })
  }

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1200,
      system:
        'You are a Filipino grocery planner. Reply with JSON only, no markdown. ' +
        'Shape: {"name": string, "ingredients": [{"name": string, "product": string, ' +
        '"perServing": number, "unit": "g"|"ml"|"pcs", "packSize": number, "packPrice": number}]}. ' +
        'perServing is the amount for ONE serving, in the given unit. ' +
        'packSize is the size of one retail pack in the same unit. ' +
        'packPrice is a realistic Philippine supermarket price in PHP. ' +
        'Use 5 to 10 ingredients. Skip water. ' +
        'If the input is not a food or dish, return {"ingredients": []}.',
      messages: [
        { role: 'user', content: `Dish: ${dish}` }
      ]
    })

    const text = message.content.find(
      block => block.type === 'text'
    )?.text ?? ''

    const json = JSON.parse(
      text.replace(/```json|```/g, '').trim()
    )

    res.json(json)

  } catch (error) {
    console.error('Recipe generation error:', error)
    res.status(500).json({ error: 'Generation failed' })
  }
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Smart-to-Cart server running on port ${PORT}`)
})
