import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Collaborative Team Hub API',
      version: '1.0.0',
      description: 'Technical Assessment API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
      {
        url: 'https://your-api.up.railway.app',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },

  apis: ['/*.ts'],
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
