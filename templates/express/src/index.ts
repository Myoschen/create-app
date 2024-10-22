import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { env } from './env'

const app = express()
const port = env.EXPRESS_PORT

// middlewares
app.use(cors())
app.use(helmet())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(morgan('dev'))

// routes
app.get('/', (_req, res) => {
  res.status(200).send({ message: 'Hello World' })
})

const server = app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`)
})

// graceful shutdown
function shutdownListener() {
  console.log('\ngracefully shutting down')
  setTimeout(() => {
    console.log('shutting down application')
    server.close(() => process.exit())
  }, 0)
}

process.on('SIGINT', shutdownListener)
process.on('SIGTERM', shutdownListener)
