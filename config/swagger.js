const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Vellux Motors',
      version: '1.0.0',
      description: 'Documentação oficial da API para o sistema de gestão da oficina Vellux Motors.',
      contact: {
        name: 'Equipe Backend Vellux',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local (Desenvolvimento)',
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
    },
  },
  // O Swagger vai procurar os comentários dentro da pasta routes
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;