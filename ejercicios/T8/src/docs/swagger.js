import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'PodcastHub API',
      version: '1.0.0',
      description: 'API REST para gestión de podcasts con autenticación JWT',
      contact: {
        name: 'PodcastHub Dev Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        BearerToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            name: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', format: 'email', example: 'juan@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Podcast: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            title: { type: 'string', example: 'Tech con Café' },
            description: { type: 'string', example: 'Un podcast sobre tecnología y desarrollo' },
            author: { $ref: '#/components/schemas/User' },
            category: {
              type: 'string',
              enum: ['tech', 'science', 'history', 'comedy', 'news'],
              example: 'tech',
            },
            duration: { type: 'number', example: 3600 },
            episodes: { type: 'number', example: 10 },
            published: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Descripción del error' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
}

export default swaggerJsdoc(options)
