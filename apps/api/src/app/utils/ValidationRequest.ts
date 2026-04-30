import { Request, Response, NextFunction } from 'express'
import { AnyZodObject } from 'zod'
import CatchAsync from './CatchAsync'

const ValidationRequest = (schema: AnyZodObject) => {
  return CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync(req.body)

    next()
  })
}

export default ValidationRequest
