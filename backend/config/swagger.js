const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Campus API",
      version: "1.0.0",
      description:
        "REST API for the Smart Campus university management platform. " +
        "All responses are wrapped in `{ success, message, data }` by a normalisation middleware.",
    },
    servers: [
      {
        url: "/api/v1",
        description: "Current server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "ok" },
            data: { type: "object", nullable: true },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred" },
            data: { type: "object", nullable: true },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["admin", "faculty", "student"] },
            isActive: { type: "boolean" },
          },
        },
        Course: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            code: { type: "string" },
            description: { type: "string" },
            credits: { type: "number" },
            faculty: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    "./routes/authRoutes.js",
    "./routes/protectedRoutes.js",
    "./routes/courseRoutes.js",
    "./routes/adminRoutes/adminRoutes.js",
    "./routes/adminRoutes/adminCourseRoutes.js",
    "./routes/adminRoutes/adminEnrollRoutes.js",
    "./routes/facultyRoutes/gradeRoutes.js",
    "./routes/facultyRoutes/attendanceRoutes.js",
    "./routes/facultyRoutes/assignmentRoutes.js",
  ],
};

module.exports = swaggerJsdoc(options);
