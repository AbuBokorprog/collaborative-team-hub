import express from 'express'
const router = express.Router()

const moduleRoutes = [
  {
    path: '/books',
    route: '',
  },
  //   {
  //     path: '/members',
  //     route: memberRouter,
  //   },
  //   {
  //     path: '/borrow',
  //     route: borrowRecordRouter,
  //   },
  //   {
  //     path: '/return',
  //     route: returnRouter,
  //   },
]

// moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router
