import express, { Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import router from './app/routers'
import GlobalErrorHandler from './app/middlewares/GlobalErrorHandler'
import NotFoundErrorHandler from './app/middlewares/NotFoundErrorHandler'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './app/docs/swagger'

const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!')
})

app.use('/api', router)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(GlobalErrorHandler)
app.use(NotFoundErrorHandler)

export default app
