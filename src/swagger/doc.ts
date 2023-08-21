import swaggerJsDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const swaggerDefinition = {
  info: {
    title: 'API document',
    version: '1.0.0',
    description: 'This is the REST API for project',
  },
  host: process.env.APP_URL,
  basePath: '/api',
  tags: [
    {
      name: '[GLOBAL] Auth',
    },
  ],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      schema: 'bearer',
      name: 'Authorization',
      in: 'header',
      prefix: 'Bearer ',
    },
  },
  definitions: {},
};

const options = {
  swaggerDefinition,
  explorer: true,
  apis: ['**/configs/routes/admin/*.ts', '**/configs/routes/user/*.ts'],
};
export default swaggerJsDoc(options);
