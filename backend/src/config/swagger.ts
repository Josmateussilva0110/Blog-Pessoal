import swaggerJsdoc, { Options } from "swagger-jsdoc"
import { env } from "./env"

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog Pessoal API",
      version: "1.0.0",
      description: "Documentação da API do portfólio/blog pessoal",
    },
    servers: [{ url: `http://localhost:${env.PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["src/routes/*.ts", "src/docs/*.ts"],
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)
