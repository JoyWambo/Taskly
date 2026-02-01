import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Taskly API',
    version: '1.0.0',
    description: 'A comprehensive task management system API',
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' ? 'https://taskly-api-d2dx.onrender.com' : 'http://localhost:5002',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          isAdmin: {
            type: 'boolean',
            example: false,
          },
          avatar: {
            type: 'string',
            example: 'avatar1.png',
          },
          preferences: {
            type: 'object',
            properties: {
              theme: {
                type: 'string',
                enum: ['light', 'dark'],
                example: 'light',
              },
              notifications: {
                type: 'boolean',
                example: true,
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
        },
      },
      Task: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          title: {
            type: 'string',
            example: 'Complete project documentation',
          },
          description: {
            type: 'string',
            example: 'Write comprehensive API documentation',
          },
          status: {
            type: 'string',
            enum: ['pending', 'in-progress', 'completed'],
            example: 'pending',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            example: 'medium',
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-31T23:59:59.000Z',
          },
          category: {
            type: 'string',
            example: '507f1f77bcf86cd799439012',
          },
          user: {
            type: 'string',
            example: '507f1f77bcf86cd799439013',
          },
          isArchived: {
            type: 'boolean',
            example: false,
          },
          comments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  example: 'Work in progress',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2023-01-01T00:00:00.000Z',
                },
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            example: 'Work',
          },
          description: {
            type: 'string',
            example: 'Work-related tasks',
          },
          color: {
            type: 'string',
            example: '#3B82F6',
          },
          icon: {
            type: 'string',
            example: 'briefcase',
          },
          user: {
            type: 'string',
            example: '507f1f77bcf86cd799439013',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          taskCount: {
            type: 'number',
            example: 5,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Error message description',
          },
          stack: {
            type: 'string',
            example: 'Error stack trace (development only)',
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./backend/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;