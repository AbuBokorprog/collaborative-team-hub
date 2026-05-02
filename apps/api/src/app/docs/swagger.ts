import swaggerJSDoc from 'swagger-jsdoc'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Collaborative Team Hub API',
      version: '1.0.0',
      description:
        'Production REST API for workspaces, goals, tasks, announcements, analytics, and realtime collaboration.',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local' },
      { url: 'https://your-api.up.railway.app', description: 'Production' },
    ],
    tags: [
      { name: 'Auth', description: 'Register, login, tokens' },
      { name: 'Users', description: 'Profile and avatar' },
      { name: 'Workspaces', description: 'Workspaces and members' },
      { name: 'Goals', description: 'Goals, milestones, activity' },
      { name: 'Tasks', description: 'Action items' },
      { name: 'Announcements', description: 'Posts, comments, reactions' },
      { name: 'Analytics', description: 'Dashboard metrics' },
      { name: 'Notifications', description: 'In-app notifications' },
      { name: 'Audit Logs', description: 'Workspace audit trail' },
      { name: 'Export', description: 'CSV export' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token from login/register response',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
        },
      },
      parameters: {
        WorkspaceHeader: {
          name: 'x-workspace-id',
          in: 'header',
          required: true,
          schema: { type: 'string' },
          description: 'Current workspace scope for member-only routes',
        },
      },
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Created' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout (clears refresh cookie)',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh tokens (rotation)',
          security: [{ cookieAuth: [] }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Current user',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/users/profile': {
        patch: {
          tags: ['Users'],
          summary: 'Update profile',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/users/avatar': {
        post: {
          tags: ['Users'],
          summary: 'Upload avatar (multipart field: avatar)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    avatar: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/workspaces': {
        get: {
          tags: ['Workspaces'],
          summary: 'List my workspaces',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'OK' } },
        },
        post: {
          tags: ['Workspaces'],
          summary: 'Create workspace (creator is ADMIN)',
          security: [{ bearerAuth: [] }],
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/workspaces/{id}': {
        get: {
          tags: ['Workspaces'],
          summary: 'Get workspace',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { '200': { description: 'OK' } },
        },
        patch: {
          tags: ['Workspaces'],
          summary: 'Update workspace (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          tags: ['Workspaces'],
          summary: 'Delete workspace (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/workspaces/{id}/invite': {
        post: {
          tags: ['Workspaces'],
          summary: 'Invite member by email (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/workspaces/{id}/members': {
        get: {
          tags: ['Workspaces'],
          summary: 'List members',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/goals': {
        get: {
          tags: ['Goals'],
          summary: 'List goals',
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: '#/components/parameters/WorkspaceHeader' }],
          responses: { '200': { description: 'OK' } },
        },
        post: {
          tags: ['Goals'],
          summary: 'Create goal',
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: '#/components/parameters/WorkspaceHeader' }],
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'List tasks',
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/WorkspaceHeader' },
            {
              name: 'workspaceId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Alternative to x-workspace-id header',
            },
          ],
          responses: { '200': { description: 'OK' } },
        },
        post: {
          tags: ['Tasks'],
          summary: 'Create task',
          security: [{ bearerAuth: [] }],
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/analytics/dashboard': {
        get: {
          tags: ['Analytics'],
          summary: 'Dashboard KPIs and completion chart',
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: '#/components/parameters/WorkspaceHeader' }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/export/csv': {
        get: {
          tags: ['Export'],
          summary: 'Export workspace CSV',
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: '#/components/parameters/WorkspaceHeader' }],
          responses: { '200': { description: 'text/csv' } },
        },
      },
      '/api/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'List notifications',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/audit-logs': {
        get: {
          tags: ['Audit Logs'],
          summary: 'List audit logs',
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: '#/components/parameters/WorkspaceHeader' }],
          responses: { '200': { description: 'OK' } },
        },
      },
    },
  },
  apis: [],
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
