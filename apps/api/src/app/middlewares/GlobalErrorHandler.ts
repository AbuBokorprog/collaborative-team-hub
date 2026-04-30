/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'

interface TGlobalErrorHandlerResponse {
  success: boolean
  status: number
  message: string
  error?: string
}

const GlobalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const status = err.status || httpStatus.BAD_REQUEST
  const message = err.message || 'Something went wrong!'

  const errorResponse: TGlobalErrorHandlerResponse = {
    success: false,
    status,
    message,
    // error: config.node_env === 'development' ? err : message, // Uncomment if using `config`
  }

  res.status(status).json(errorResponse)
}

export default GlobalErrorHandler
