import { TOptions } from '../interface/containts'

export const calculatePagination = (options: TOptions) => {
  const page = Math.max(1, Number(options.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 10))
  const skip = (page - 1) * limit
  const sortBy = (options.sortBy as string) || 'createdAt'
  const sortOrder = (options.sortOrder as string) === 'asc' ? 'asc' : 'desc'

  return { page, limit, sortBy, sortOrder, skip }
}
