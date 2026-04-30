class AppError extends Error {
  public status: number
  constructor(message: string, status: number, stack = '') {
    super(message)
    this.status = status

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
