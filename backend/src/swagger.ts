import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.1.0",
  info: {
    title: "Fitness & Nutrition API",
    version: "1.0.0",
    description: "OpenAPI spec for your backend endpoints.",
  },
  servers: [
    { url: "http://localhost:3010", description: "Local" },
    { url: "https://api.tu-dominio.com", description: "Production" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
};

export const swaggerOptions: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  // Scan your route files that contain JSDoc OpenAPI annotations:
  apis: ["./src/routes/**/*.ts", "./src/server.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
