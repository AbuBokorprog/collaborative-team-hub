import { Request, Response, NextFunction } from 'express'
import { AnyZodObject } from 'zod'
import CatchAsync from './CatchAsync'

/** Validates merged `{ body, query, params, cookies }` and assigns parsed slices back to `req`. */
const ValidationRequest = (schema: AnyZodObject) => {
  return CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    })
    if (parsed.body !== undefined) req.body = parsed.body
    if (parsed.query !== undefined)
      Object.assign(req.query as object, parsed.query as object)
    if (parsed.params !== undefined)
      Object.assign(req.params as object, parsed.params as object)
    next()
  })
}

export default ValidationRequest
