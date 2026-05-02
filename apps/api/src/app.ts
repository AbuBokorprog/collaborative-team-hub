import express, { Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import router from './app/routers'
import GlobalErrorHandler from './app/middlewares/GlobalErrorHandler'
import NotFoundErrorHandler from './app/middlewares/NotFoundErrorHandler'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './app/docs/swagger'
import config from './app/config'

const app = express()

app.use(
  cors({
    origin: config.client_url,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
  res.send('Collaborative Team Hub API')
})

app.use('/api', router)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(NotFoundErrorHandler)
app.use(GlobalErrorHandler)

export default app
