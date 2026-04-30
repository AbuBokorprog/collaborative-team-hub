import { Server } from 'http'
import app from './app'
import config from './app/config'

async function main() {
  // ... you will write your Prisma Client queries here
  const server: Server = app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`)
  })
}

main()
