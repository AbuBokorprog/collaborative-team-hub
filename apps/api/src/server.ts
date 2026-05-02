import http from 'http'
import { Server } from 'socket.io'
import app from './app'
import config from './app/config'
import { registerSockets } from './app/sockets'

async function main() {
  const httpServer = http.createServer(app)

  const io = new Server(httpServer, {
    cors: {
      origin: config.client_url,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  })

  app.set('io', io)
  registerSockets(io)

  const port = config.port || 5000
  httpServer.listen(port, () => {
    console.log(`API listening on port ${port}`)
  })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
