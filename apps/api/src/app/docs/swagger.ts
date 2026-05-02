import swaggerJSDoc from 'swagger-jsdoc'

const ok = { description: 'OK' }
const created = { description: 'Created' }
const deleted = { description: 'Deleted' }
const csv = {
  description: 'CSV file',
  content: {
    'text/csv': {
      schema: { type: 'string' },
    },
  },
}

const bearer = [{ bearerAuth: [] }]
const pathId = (name = 'id', description = 'Resource id') => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string' },
})
const pageQuery = [
  { name: 'page', in: 'query', schema: { type: 'number', minimum: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'number', minimum: 1 } },
  {
    name: 'sortOrder',
    in: 'query',
    schema: { type: 'string', enum: ['asc', 'desc'] },
  },
]
const workspaceHeader = { $ref: '#/components/parameters/WorkspaceHeader' }
const workspacePath = pathId('workspaceId', 'Workspace id')
const jsonBody = (schema: Record<string, unknown>, required = false) => ({
  required,
  content: {
    'application/json': { schema },
  },
})

const authRequired = {
  security: bearer,
  responses: { '200': ok, '401': { description: 'Unauthorized' } },
}

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Collaborative Team Hub API',
      version: '1.0.0',
      description:
        'REST API for authentication, workspaces, goals, milestones, tasks, announcements, notifications, analytics, audit logs, and CSV export.',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local' },
      { url: 'https://your-api.up.railway.app', description: 'Production' },
    ],
    tags: [
      { name: 'Auth', description: 'Registration, login, token refresh, account access' },
      { name: 'Users', description: 'Profiles, preferences, activity, contributions' },
      { name: 'Workspaces', description: 'Workspace settings and members' },
      { name: 'Goals', description: 'Workspace goals, milestones, and activity feed' },
      { name: 'Milestones', description: 'Milestone updates and deletion' },
      { name: 'Tasks', description: 'Task CRUD, board, movement, and ordering' },
      { name: 'Announcements', description: 'Announcements, comments, reactions, pins' },
      { name: 'Notifications', description: 'Notification inbox and preferences' },
      { name: 'Analytics', description: 'Dashboard and workspace analytics' },
      { name: 'Audit Logs', description: 'Workspace audit trail' },
      { name: 'Export', description: 'Workspace CSV export' },
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
          description: 'HTTP-only refresh token cookie',
        },
      },
      parameters: {
        WorkspaceHeader: {
          name: 'x-workspace-id',
          in: 'header',
          required: true,
          schema: { type: 'string' },
          description: 'Current workspace scope for header-based routes',
        },
        OptionalWorkspaceHeader: {
          name: 'x-workspace-id',
          in: 'header',
          required: false,
          schema: { type: 'string' },
          description: 'Optional workspace scope. Can be replaced by workspaceId query.',
        },
      },
      schemas: {
        SuccessEnvelope: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            status: { type: 'number', example: 200 },
            message: { type: 'string' },
            data: {},
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Alex Chen' },
            email: { type: 'string', format: 'email', example: 'alex@teamhub.io' },
            password: { type: 'string', minLength: 6, example: 'Secure@123' },
            workspaceName: { type: 'string', example: 'TeamHub HQ' },
            description: { type: 'string', example: 'Product collaboration workspace' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        WorkspaceInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            accentColor: { type: 'string', example: '#6366f1' },
          },
        },
        InviteInput: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['ADMIN', 'MEMBER'] },
          },
        },
        GoalInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            dueDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'BLOCKED'],
            },
            ownerId: { type: 'string' },
            creatorId: { type: 'string', description: 'Nested-route alias for ownerId' },
          },
        },
        MilestoneInput: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            progressPercentage: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
        GoalUpdateInput: {
          type: 'object',
          required: ['body'],
          properties: {
            body: { type: 'string' },
          },
        },
        TaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            desc: { type: 'string', description: 'Nested-route alias for description' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
            column: { type: 'string', enum: ['todo', 'inProgress', 'review', 'done'] },
            dueDate: { type: 'string', format: 'date-time' },
            assigneeId: { type: 'string', nullable: true },
            goalId: { type: 'string', nullable: true },
            workspaceId: { type: 'string', description: 'Required for /api/tasks POST' },
          },
        },
        AnnouncementInput: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            pinned: { type: 'boolean' },
          },
        },
        CommentInput: {
          type: 'object',
          required: ['body'],
          properties: {
            body: { type: 'string' },
          },
        },
        ReactionInput: {
          type: 'object',
          required: ['emoji'],
          properties: {
            emoji: { type: 'string', example: ':thumbsup:' },
          },
        },
        NotificationPreferenceInput: {
          type: 'object',
          properties: {
            emailMentions: { type: 'boolean' },
            emailTaskAssignments: { type: 'boolean' },
            emailGoalUpdates: { type: 'boolean' },
            emailWeeklyDigest: { type: 'boolean' },
            pushMentions: { type: 'boolean' },
            pushDueDateReminders: { type: 'boolean' },
            pushAnnouncements: { type: 'boolean' },
            desktopSound: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: jsonBody({ $ref: '#/components/schemas/RegisterInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: jsonBody({ $ref: '#/components/schemas/LoginInput' }, true),
          responses: { '200': ok },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token using refresh cookie or body token',
          security: [{ cookieAuth: [] }],
          requestBody: jsonBody({
            type: 'object',
            properties: { refreshToken: { type: 'string' } },
          }),
          responses: { '200': ok },
        },
      },
      '/api/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Request password reset email',
          requestBody: jsonBody({
            type: 'object',
            required: ['email'],
            properties: { email: { type: 'string', format: 'email' } },
          }, true),
          responses: { '200': ok },
        },
      },
      '/api/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Reset password using token',
          requestBody: jsonBody({
            type: 'object',
            required: ['token', 'password'],
            properties: {
              token: { type: 'string' },
              password: { type: 'string', minLength: 6 },
            },
          }, true),
          responses: { '200': ok, '501': { description: 'Reset persistence not configured' } },
        },
      },
      '/api/auth/verify-email': {
        post: {
          tags: ['Auth'],
          summary: 'Verify email with code',
          requestBody: jsonBody({
            type: 'object',
            required: ['email', 'code'],
            properties: {
              email: { type: 'string', format: 'email' },
              code: { type: 'string' },
            },
          }, true),
          responses: { '200': ok },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout and clear refresh cookie',
          responses: { '200': ok },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current authenticated user',
          ...authRequired,
        },
      },

      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List users in the active workspace',
          security: bearer,
          parameters: [workspaceHeader],
          responses: { '200': ok },
        },
      },
      '/api/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Get current user profile',
          ...authRequired,
        },
        patch: {
          tags: ['Users'],
          summary: 'Update current user profile',
          security: bearer,
          requestBody: jsonBody({
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string' },
              bio: { type: 'string' },
              location: { type: 'string' },
              website: { type: 'string', format: 'uri' },
              github: { type: 'string' },
              twitter: { type: 'string' },
            },
          }),
          responses: { '200': ok },
        },
        delete: {
          tags: ['Users'],
          summary: 'Soft delete current user account',
          ...authRequired,
        },
      },
      '/api/users/profile': {
        patch: {
          tags: ['Users'],
          summary: 'Legacy profile update alias',
          security: bearer,
          requestBody: jsonBody({
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
          }),
          responses: { '200': ok },
        },
      },
      '/api/users/me/password': {
        patch: {
          tags: ['Users'],
          summary: 'Change current user password',
          security: bearer,
          requestBody: jsonBody({
            type: 'object',
            required: ['currentPassword', 'newPassword'],
            properties: {
              currentPassword: { type: 'string' },
              newPassword: { type: 'string', minLength: 6 },
            },
          }, true),
          responses: { '200': ok },
        },
      },
      '/api/users/me/preferences': {
        patch: {
          tags: ['Users'],
          summary: 'Update current user UI preferences',
          security: bearer,
          requestBody: jsonBody({
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark', 'system'] },
              language: { type: 'string' },
              timezone: { type: 'string' },
            },
          }),
          responses: { '200': ok },
        },
      },
      '/api/users/avatar': {
        post: {
          tags: ['Users'],
          summary: 'Upload avatar',
          security: bearer,
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['avatar'],
                  properties: {
                    avatar: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { '200': ok },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by id',
          security: bearer,
          parameters: [pathId()],
          responses: { '200': ok },
        },
      },
      '/api/users/{id}/activity': {
        get: {
          tags: ['Users'],
          summary: 'Get user activity',
          security: bearer,
          parameters: [pathId()],
          responses: { '200': ok },
        },
      },
      '/api/users/{id}/contributions': {
        get: {
          tags: ['Users'],
          summary: 'Get user contribution counts',
          security: bearer,
          parameters: [pathId()],
          responses: { '200': ok },
        },
      },

      '/api/workspaces': {
        get: {
          tags: ['Workspaces'],
          summary: 'List workspaces for current user',
          ...authRequired,
        },
        post: {
          tags: ['Workspaces'],
          summary: 'Create workspace',
          security: bearer,
          requestBody: jsonBody({ $ref: '#/components/schemas/WorkspaceInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/workspaces/{id}': {
        get: {
          tags: ['Workspaces'],
          summary: 'Get workspace details',
          security: bearer,
          parameters: [pathId()],
          responses: { '200': ok },
        },
        patch: {
          tags: ['Workspaces'],
          summary: 'Update workspace (admin)',
          security: bearer,
          parameters: [pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/WorkspaceInput' }),
          responses: { '200': ok },
        },
        delete: {
          tags: ['Workspaces'],
          summary: 'Delete workspace (admin)',
          security: bearer,
          parameters: [pathId()],
          responses: { '200': deleted },
        },
      },
      '/api/workspaces/{id}/invite': {
        post: {
          tags: ['Workspaces'],
          summary: 'Invite member by email (admin, legacy path)',
          security: bearer,
          parameters: [pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/InviteInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/workspaces/{id}/members/invite': {
        post: {
          tags: ['Workspaces'],
          summary: 'Invite member by email (admin)',
          security: bearer,
          parameters: [pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/InviteInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/workspaces/{id}/members': {
        get: {
          tags: ['Workspaces'],
          summary: 'List workspace members',
          security: bearer,
          parameters: [pathId()],
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{id}/stats': {
        get: {
          tags: ['Workspaces'],
          summary: 'Get workspace statistics',
          security: bearer,
          parameters: [pathId()],
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{id}/members/{userId}': {
        patch: {
          tags: ['Workspaces'],
          summary: 'Update member role (admin)',
          security: bearer,
          parameters: [pathId(), pathId('userId', 'Member user id')],
          requestBody: jsonBody({
            type: 'object',
            required: ['role'],
            properties: { role: { type: 'string', enum: ['ADMIN', 'MEMBER'] } },
          }, true),
          responses: { '200': ok },
        },
        delete: {
          tags: ['Workspaces'],
          summary: 'Remove member from workspace (admin)',
          security: bearer,
          parameters: [pathId(), pathId('userId', 'Member user id')],
          responses: { '200': deleted },
        },
      },

      '/api/goals': {
        get: {
          tags: ['Goals'],
          summary: 'List goals using x-workspace-id',
          security: bearer,
          parameters: [
            workspaceHeader,
            ...pageQuery,
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'BLOCKED'] },
            },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': ok },
        },
        post: {
          tags: ['Goals'],
          summary: 'Create goal using x-workspace-id',
          security: bearer,
          parameters: [workspaceHeader],
          requestBody: jsonBody({
            allOf: [{ $ref: '#/components/schemas/GoalInput' }],
            required: ['title', 'ownerId'],
          }, true),
          responses: { '201': created },
        },
      },
      '/api/goals/{id}': {
        get: {
          tags: ['Goals'],
          summary: 'Get goal',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          responses: { '200': ok },
        },
        patch: {
          tags: ['Goals'],
          summary: 'Update goal',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/GoalInput' }),
          responses: { '200': ok },
        },
        delete: {
          tags: ['Goals'],
          summary: 'Delete goal',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          responses: { '200': deleted },
        },
      },
      '/api/goals/{id}/activity': {
        get: {
          tags: ['Goals'],
          summary: 'List goal activity updates',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          responses: { '200': ok },
        },
      },
      '/api/goals/{id}/updates': {
        post: {
          tags: ['Goals'],
          summary: 'Post goal activity update',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/GoalUpdateInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/goals/{id}/milestones': {
        post: {
          tags: ['Goals'],
          summary: 'Create milestone for goal',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          requestBody: jsonBody({
            allOf: [{ $ref: '#/components/schemas/MilestoneInput' }],
            required: ['title'],
          }, true),
          responses: { '201': created },
        },
      },

      '/api/milestones/{id}': {
        patch: {
          tags: ['Milestones'],
          summary: 'Update milestone',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/MilestoneInput' }),
          responses: { '200': ok },
        },
        delete: {
          tags: ['Milestones'],
          summary: 'Delete milestone',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          responses: { '200': deleted },
        },
      },

      '/api/tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'List tasks using x-workspace-id or workspaceId query',
          security: bearer,
          parameters: [
            { $ref: '#/components/parameters/OptionalWorkspaceHeader' },
            { name: 'workspaceId', in: 'query', schema: { type: 'string' } },
            ...pageQuery,
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] } },
            { name: 'goalId', in: 'query', schema: { type: 'string' } },
            { name: 'assigneeId', in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': ok },
        },
        post: {
          tags: ['Tasks'],
          summary: 'Create task',
          security: bearer,
          requestBody: jsonBody({
            allOf: [{ $ref: '#/components/schemas/TaskInput' }],
            required: ['title', 'workspaceId'],
          }, true),
          responses: { '201': created },
        },
      },
      '/api/tasks/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Get task',
          security: bearer,
          parameters: [
            { $ref: '#/components/parameters/OptionalWorkspaceHeader' },
            { name: 'workspaceId', in: 'query', schema: { type: 'string' } },
            pathId(),
          ],
          responses: { '200': ok },
        },
        patch: {
          tags: ['Tasks'],
          summary: 'Update task',
          security: bearer,
          parameters: [
            { $ref: '#/components/parameters/OptionalWorkspaceHeader' },
            { name: 'workspaceId', in: 'query', schema: { type: 'string' } },
            pathId(),
          ],
          requestBody: jsonBody({ $ref: '#/components/schemas/TaskInput' }),
          responses: { '200': ok },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete task',
          security: bearer,
          parameters: [
            { $ref: '#/components/parameters/OptionalWorkspaceHeader' },
            { name: 'workspaceId', in: 'query', schema: { type: 'string' } },
            pathId(),
          ],
          responses: { '200': deleted },
        },
      },

      '/api/announcements': {
        get: {
          tags: ['Announcements'],
          summary: 'List announcements using x-workspace-id',
          security: bearer,
          parameters: [workspaceHeader, ...pageQuery, { name: 'search', in: 'query', schema: { type: 'string' } }],
          responses: { '200': ok },
        },
        post: {
          tags: ['Announcements'],
          summary: 'Create announcement (admin)',
          security: bearer,
          parameters: [workspaceHeader],
          requestBody: jsonBody({ $ref: '#/components/schemas/AnnouncementInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/announcements/{id}': {
        patch: {
          tags: ['Announcements'],
          summary: 'Update announcement',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/AnnouncementInput' }),
          responses: { '200': ok },
        },
        delete: {
          tags: ['Announcements'],
          summary: 'Delete announcement',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          responses: { '200': deleted },
        },
      },
      '/api/announcements/{id}/react': {
        post: {
          tags: ['Announcements'],
          summary: 'React to announcement',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/ReactionInput' }, true),
          responses: { '200': ok },
        },
      },
      '/api/announcements/{id}/comment': {
        post: {
          tags: ['Announcements'],
          summary: 'Comment on announcement',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/CommentInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/announcements/{id}/pin': {
        post: {
          tags: ['Announcements'],
          summary: 'Pin announcement (admin)',
          security: bearer,
          parameters: [workspaceHeader, pathId()],
          responses: { '200': ok },
        },
      },

      '/api/analytics/dashboard': {
        get: {
          tags: ['Analytics'],
          summary: 'Dashboard KPIs using x-workspace-id',
          security: bearer,
          parameters: [workspaceHeader],
          responses: { '200': ok },
        },
      },
      '/api/export/csv': {
        get: {
          tags: ['Export'],
          summary: 'Export workspace data as CSV',
          security: bearer,
          parameters: [workspaceHeader],
          responses: { '200': csv },
        },
      },
      '/api/audit-logs': {
        get: {
          tags: ['Audit Logs'],
          summary: 'List workspace audit logs',
          security: bearer,
          parameters: [workspaceHeader, ...pageQuery],
          responses: { '200': ok },
        },
      },

      '/api/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'List current user notifications',
          security: bearer,
          parameters: pageQuery,
          responses: { '200': ok },
        },
        delete: {
          tags: ['Notifications'],
          summary: 'Delete all read notifications',
          ...authRequired,
        },
      },
      '/api/notifications/unread-count': {
        get: {
          tags: ['Notifications'],
          summary: 'Get unread notification count',
          ...authRequired,
        },
      },
      '/api/notifications/preferences': {
        get: {
          tags: ['Notifications'],
          summary: 'Get notification preferences',
          ...authRequired,
        },
        patch: {
          tags: ['Notifications'],
          summary: 'Update notification preferences',
          security: bearer,
          requestBody: jsonBody({ $ref: '#/components/schemas/NotificationPreferenceInput' }),
          responses: { '200': ok },
        },
      },
      '/api/notifications/read-all': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark all notifications as read',
          ...authRequired,
        },
      },
      '/api/notifications/{id}': {
        delete: {
          tags: ['Notifications'],
          summary: 'Delete notification',
          security: bearer,
          parameters: [pathId()],
          responses: { '200': deleted },
        },
      },
      '/api/notifications/{id}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark notification as read',
          security: bearer,
          parameters: [pathId()],
          responses: { '200': ok },
        },
      },

      '/api/workspaces/{workspaceId}/goals': {
        get: {
          tags: ['Goals'],
          summary: 'List workspace goals using nested route',
          security: bearer,
          parameters: [workspacePath, ...pageQuery],
          responses: { '200': ok },
        },
        post: {
          tags: ['Goals'],
          summary: 'Create workspace goal using nested route',
          security: bearer,
          parameters: [workspacePath],
          requestBody: jsonBody({ $ref: '#/components/schemas/GoalInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/workspaces/{workspaceId}/goals/{id}': {
        get: {
          tags: ['Goals'],
          summary: 'Get workspace goal using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          responses: { '200': ok },
        },
        put: {
          tags: ['Goals'],
          summary: 'Full update workspace goal using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/GoalInput' }),
          responses: { '200': ok },
        },
        patch: {
          tags: ['Goals'],
          summary: 'Partial update workspace goal using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/GoalInput' }),
          responses: { '200': ok },
        },
        delete: {
          tags: ['Goals'],
          summary: 'Delete workspace goal using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          responses: { '200': deleted },
        },
      },
      '/api/workspaces/{workspaceId}/goals/{id}/progress': {
        patch: {
          tags: ['Goals'],
          summary: 'Update goal progress using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          requestBody: jsonBody({
            type: 'object',
            required: ['progress'],
            properties: { progress: { type: 'number', minimum: 0, maximum: 100 } },
          }, true),
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/goals/{id}/members': {
        post: {
          tags: ['Goals'],
          summary: 'Add/accept goal member using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          requestBody: jsonBody({
            type: 'object',
            required: ['userId'],
            properties: { userId: { type: 'string' } },
          }, true),
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/goals/{id}/members/{uid}': {
        delete: {
          tags: ['Goals'],
          summary: 'Remove goal member using nested route',
          security: bearer,
          parameters: [workspacePath, pathId(), pathId('uid', 'Goal member user id')],
          responses: { '200': deleted },
        },
      },

      '/api/workspaces/{workspaceId}/tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'List workspace tasks using nested route',
          security: bearer,
          parameters: [
            workspacePath,
            ...pageQuery,
            { name: 'column', in: 'query', schema: { type: 'string', enum: ['todo', 'inProgress', 'review', 'done'] } },
            { name: 'priority', in: 'query', schema: { type: 'string' } },
            { name: 'assigneeId', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': ok },
        },
        post: {
          tags: ['Tasks'],
          summary: 'Create workspace task using nested route',
          security: bearer,
          parameters: [workspacePath],
          requestBody: jsonBody({ $ref: '#/components/schemas/TaskInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/workspaces/{workspaceId}/tasks/board': {
        get: {
          tags: ['Tasks'],
          summary: 'Get grouped task board using nested route',
          security: bearer,
          parameters: [workspacePath],
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/tasks/bulk-move': {
        post: {
          tags: ['Tasks'],
          summary: 'Move multiple tasks using nested route',
          security: bearer,
          parameters: [workspacePath],
          requestBody: jsonBody({
            type: 'object',
            required: ['taskIds', 'column'],
            properties: {
              taskIds: { type: 'array', items: { type: 'string' } },
              column: { type: 'string', enum: ['todo', 'inProgress', 'review', 'done'] },
              status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
            },
          }, true),
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/tasks/reorder': {
        post: {
          tags: ['Tasks'],
          summary: 'Accept task reorder payload using nested route',
          security: bearer,
          parameters: [workspacePath],
          requestBody: jsonBody({
            type: 'object',
            properties: {
              column: { type: 'string' },
              taskIds: { type: 'array', items: { type: 'string' } },
            },
          }),
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/tasks/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Get workspace task using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          responses: { '200': ok },
        },
        put: {
          tags: ['Tasks'],
          summary: 'Full update workspace task using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/TaskInput' }),
          responses: { '200': ok },
        },
        patch: {
          tags: ['Tasks'],
          summary: 'Partial update workspace task using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/TaskInput' }),
          responses: { '200': ok },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete workspace task using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          responses: { '200': deleted },
        },
      },
      '/api/workspaces/{workspaceId}/tasks/{id}/move': {
        patch: {
          tags: ['Tasks'],
          summary: 'Move task to a column using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          requestBody: jsonBody({
            type: 'object',
            required: ['column'],
            properties: {
              column: { type: 'string', enum: ['todo', 'inProgress', 'review', 'done'] },
              position: { type: 'number' },
            },
          }, true),
          responses: { '200': ok },
        },
      },

      '/api/workspaces/{workspaceId}/announcements': {
        get: {
          tags: ['Announcements'],
          summary: 'List workspace announcements using nested route',
          security: bearer,
          parameters: [workspacePath, ...pageQuery, { name: 'search', in: 'query', schema: { type: 'string' } }],
          responses: { '200': ok },
        },
        post: {
          tags: ['Announcements'],
          summary: 'Create workspace announcement using nested route',
          security: bearer,
          parameters: [workspacePath],
          requestBody: jsonBody({ $ref: '#/components/schemas/AnnouncementInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/workspaces/{workspaceId}/announcements/{id}': {
        get: {
          tags: ['Announcements'],
          summary: 'Get workspace announcement using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          responses: { '200': ok },
        },
        patch: {
          tags: ['Announcements'],
          summary: 'Update workspace announcement using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/AnnouncementInput' }),
          responses: { '200': ok },
        },
        delete: {
          tags: ['Announcements'],
          summary: 'Delete workspace announcement using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          responses: { '200': deleted },
        },
      },
      '/api/workspaces/{workspaceId}/announcements/{id}/pin': {
        patch: {
          tags: ['Announcements'],
          summary: 'Toggle announcement pin using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/announcements/{id}/reactions': {
        post: {
          tags: ['Announcements'],
          summary: 'React to announcement using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/ReactionInput' }, true),
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/announcements/{id}/comments': {
        get: {
          tags: ['Announcements'],
          summary: 'List announcement comments using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          responses: { '200': ok },
        },
        post: {
          tags: ['Announcements'],
          summary: 'Create announcement comment using nested route',
          security: bearer,
          parameters: [workspacePath, pathId()],
          requestBody: jsonBody({ $ref: '#/components/schemas/CommentInput' }, true),
          responses: { '201': created },
        },
      },
      '/api/workspaces/{workspaceId}/announcements/{id}/comments/{cId}': {
        delete: {
          tags: ['Announcements'],
          summary: 'Delete announcement comment using nested route',
          security: bearer,
          parameters: [workspacePath, pathId(), pathId('cId', 'Comment id')],
          responses: { '200': deleted },
        },
      },

      '/api/workspaces/{workspaceId}/analytics/overview': {
        get: {
          tags: ['Analytics'],
          summary: 'Workspace analytics overview',
          security: bearer,
          parameters: [workspacePath],
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/analytics/tasks': {
        get: {
          tags: ['Analytics'],
          summary: 'Workspace task analytics',
          security: bearer,
          parameters: [workspacePath],
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/analytics/activity': {
        get: {
          tags: ['Analytics'],
          summary: 'Workspace activity analytics',
          security: bearer,
          parameters: [workspacePath],
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/analytics/goals': {
        get: {
          tags: ['Analytics'],
          summary: 'Workspace goal analytics',
          security: bearer,
          parameters: [workspacePath],
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/analytics/velocity': {
        get: {
          tags: ['Analytics'],
          summary: 'Workspace velocity analytics',
          security: bearer,
          parameters: [workspacePath],
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/analytics/members': {
        get: {
          tags: ['Analytics'],
          summary: 'Workspace member contribution analytics',
          security: bearer,
          parameters: [workspacePath],
          responses: { '200': ok },
        },
      },
      '/api/workspaces/{workspaceId}/analytics/heatmap': {
        get: {
          tags: ['Analytics'],
          summary: 'Workspace activity heatmap',
          security: bearer,
          parameters: [workspacePath],
          responses: { '200': ok },
        },
      },
    },
  },
  apis: [],
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
