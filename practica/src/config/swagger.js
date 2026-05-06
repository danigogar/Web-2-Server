import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'BildyApp API',
      version: '1.0.0',
      description: 'API para gestión de albaranes - BildyApp'
    },
    components: {
      securitySchemes: {
        BearerToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ BearerToken: [] }]
  },
  apis: ['./src/routes/*.js']
};

export const swaggerSpecs = swaggerJsdoc(options);
