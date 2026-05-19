import 'dotenv/config'
import { createApp } from './app.js'

const PORT = parseInt(process.env.PORT ?? '4000', 10)

const app = createApp()

app.listen(PORT, () => {
  console.log(`[api] Server running on http://localhost:${PORT}`)
  console.log(`[api] Environment: ${process.env.NODE_ENV ?? 'development'}`)
})
