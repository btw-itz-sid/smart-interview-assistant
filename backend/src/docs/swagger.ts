// ============================================
// Swagger / OpenAPI Configuration
// API documentation setup - saare endpoints yahan documented hain
// http://localhost:5000/api/docs pe jaake dekho
// ============================================

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Interview Assistant API',
      version: '1.0.0',
      description: `
## AI-Powered Interview Preparation Backend

Full-stack API for intelligent interview preparation:

- **AI Mock Interviews** — Generate topic-specific questions and evaluate answers with AI
- **Progress Tracking** — Track performance analytics over time
- **Resume Analyzer** — Get ATS score, keyword analysis, and improvement suggestions
- **JWT Auth** — Secure token-based authentication

### Authentication
Sabhi protected routes ke liye \`Authorization: Bearer <token>\` header chahiye.
Token login/register endpoint se milta hai.
      `,
      contact: {
        name: 'Smart Interview Assistant',
        email: 'support@smartinterview.dev',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Login ke baad mila hua JWT token yahan paste karo',
        },
      },
      schemas: {
        // ---- Auth Schemas ----
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Rahul Sharma', minLength: 2 },
            email: { type: 'string', format: 'email', example: 'rahul@gmail.com' },
            password: { type: 'string', minLength: 6, example: 'mypassword123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'rahul@gmail.com' },
            password: { type: 'string', example: 'mypassword123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful!' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Rahul Sharma' },
                    email: { type: 'string', example: 'rahul@gmail.com' },
                  },
                },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },

        // ---- AI Interview Schemas ----
        GenerateQuestionsRequest: {
          type: 'object',
          required: ['topic'],
          properties: {
            topic: { type: 'string', example: 'JavaScript Promises', minLength: 2 },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              default: 'medium',
              example: 'medium',
            },
            count: { type: 'integer', minimum: 1, maximum: 10, default: 3, example: 3 },
          },
        },
        EvaluateAnswerRequest: {
          type: 'object',
          required: ['questionId', 'interviewId', 'question', 'answer', 'topic'],
          properties: {
            questionId: { type: 'integer', example: 1 },
            interviewId: { type: 'integer', example: 1 },
            question: { type: 'string', example: 'What is a Promise in JavaScript?' },
            answer: { type: 'string', example: 'A Promise is an object representing an eventual completion...' },
            topic: { type: 'string', example: 'JavaScript Promises' },
          },
        },

        // ---- Resume Schemas ----
        ResumeAnalyzeRequest: {
          type: 'object',
          required: ['resumeText'],
          properties: {
            resumeText: { type: 'string', minLength: 50, example: 'John Doe\nSoftware Engineer\n3 years experience in Node.js...' },
            jobRole: { type: 'string', example: 'Backend Developer', maxLength: 200 },
          },
        },

        // ---- Error Schema ----
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Valid email dalo bhai' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Server status check' },
      { name: 'Auth', description: 'User registration, login, and profile' },
      { name: 'AI Interview', description: 'Mock interview generation and evaluation' },
      { name: 'Progress', description: 'User performance analytics' },
      { name: 'Resume', description: 'Resume analysis and suggestions' },
    ],
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Server health check',
          description: 'Check karo ki server live hai ya nahi',
          responses: {
            200: { description: 'Server is running' },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register new user',
          description: 'Naya account banao - name, email, password chahiye',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
          },
          responses: {
            201: { description: 'Registration successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          description: 'Email aur password se login karo - JWT token milega',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Wrong credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/auth/profile': {
        get: {
          tags: ['Auth'],
          summary: 'Get user profile',
          description: 'Logged in user ki profile dekho',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Profile data retrieved' },
            401: { description: 'Unauthorized - Login required' },
          },
        },
      },
      '/api/ai/generate-questions': {
        post: {
          tags: ['AI Interview'],
          summary: 'Generate interview questions',
          description: 'AI se topic pe interview questions generate karo. Ek naya interview session shuru hota hai.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GenerateQuestionsRequest' } } },
          },
          responses: {
            201: { description: 'Questions generated' },
            401: { description: 'Unauthorized' },
            400: { description: 'Validation error' },
          },
        },
      },
      '/api/ai/evaluate-answer': {
        post: {
          tags: ['AI Interview'],
          summary: 'Evaluate your answer',
          description: 'Question ka answer do - AI evaluates and gives score + feedback',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/EvaluateAnswerRequest' } } },
          },
          responses: {
            200: { description: 'Answer evaluated' },
            401: { description: 'Unauthorized' },
            403: { description: 'This interview does not belong to you' },
            404: { description: 'Interview not found' },
          },
        },
      },
      '/api/ai/chat-history': {
        get: {
          tags: ['AI Interview'],
          summary: 'Get all interview history',
          description: 'Apni saari past interviews aur unke Q&A dekho',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'History retrieved' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/ai/interview/{id}': {
        get: {
          tags: ['AI Interview'],
          summary: 'Get specific interview detail',
          description: 'Ek specific interview ki poori detail dekho',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'Interview ID' },
          ],
          responses: {
            200: { description: 'Interview detail retrieved' },
            404: { description: 'Interview not found' },
          },
        },
      },
      '/api/progress/analytics': {
        get: {
          tags: ['Progress'],
          summary: 'Get analytics dashboard',
          description: 'Saari performance analytics - total interviews, avg score, topic-wise breakdown',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Analytics data retrieved' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/progress/topics': {
        get: {
          tags: ['Progress'],
          summary: 'Get topic-wise progress',
          description: 'Har topic pe kitne interviews diye aur kitna score aaya',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Topic progress retrieved' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/resume/analyze': {
        post: {
          tags: ['Resume'],
          summary: 'Analyze your resume',
          description: 'Resume text paste karo - AI detailed feedback, score, ATS check aur improvement suggestions dega',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ResumeAnalyzeRequest' } } },
          },
          responses: {
            200: { description: 'Resume analyzed' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/resume/suggest-topics': {
        post: {
          tags: ['Resume'],
          summary: 'Suggest interview topics from resume',
          description: 'Resume ke basis pe AI batayega ki kaunse topics pe interview prepare karo',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ResumeAnalyzeRequest' } } },
          },
          responses: {
            200: { description: 'Topics suggested' },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  },
  apis: [], // We're defining paths inline above
};

export const swaggerSpec = swaggerJsdoc(options);
