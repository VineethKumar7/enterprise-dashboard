export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Enterprise Dashboard API',
    version: '1.0.0',
    description: 'REST API for Enterprise Dashboard with Microsoft Dataverse integration',
    contact: {
      name: 'Vineeth Kumar',
      email: 'k.vineeth26@gmail.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Analytics', description: 'Dashboard metrics and KPIs' },
    { name: 'Accounts', description: 'Company/Organization records' },
    { name: 'Contacts', description: 'Individual contact records' },
    { name: 'Opportunities', description: 'Sales opportunities' },
    { name: 'Reports', description: 'Custom reports (MongoDB)' },
    { name: 'Admin', description: 'Database administration' },
  ],
  paths: {
    '/api/analytics': {
      get: {
        tags: ['Analytics'],
        summary: 'Get dashboard metrics',
        description: 'Returns aggregated metrics for the dashboard. Results are cached for 5 minutes.',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    cached: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        totalAccounts: { type: 'number', example: 8 },
                        totalContacts: { type: 'number', example: 10 },
                        totalOpportunities: { type: 'number', example: 12 },
                        totalRevenue: { type: 'number', example: 29150000 },
                        revenueByMonth: { type: 'array', items: { type: 'object' } },
                        opportunitiesByStage: { type: 'array', items: { type: 'object' } },
                        topAccounts: { type: 'array', items: { type: 'object' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/dataverse/accounts': {
      get: {
        tags: ['Accounts'],
        summary: 'List all accounts',
        description: 'Returns paginated list of accounts from Dataverse',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Results per page' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Skip N results' },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Account' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Accounts'],
        summary: 'Create a new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Acme Corp' },
                  revenue: { type: 'number', example: 1000000 },
                  telephone1: { type: 'string', example: '+49 123 456789' },
                  emailaddress1: { type: 'string', example: 'contact@acme.com' },
                  address1_city: { type: 'string', example: 'Berlin' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Account created successfully' },
          400: { description: 'Invalid request body' },
        },
      },
    },
    '/api/dataverse/contacts': {
      get: {
        tags: ['Contacts'],
        summary: 'List all contacts',
        description: 'Returns paginated list of contacts from Dataverse',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Contact' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/dataverse/opportunities': {
      get: {
        tags: ['Opportunities'],
        summary: 'List all opportunities',
        description: 'Returns paginated list of sales opportunities from Dataverse',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Opportunity' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/reports': {
      get: {
        tags: ['Reports'],
        summary: 'List all reports',
        description: 'Returns all custom reports stored in MongoDB',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Report' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Reports'],
        summary: 'Create a new report',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'type'],
                properties: {
                  title: { type: 'string', example: 'Q1 Sales Report' },
                  description: { type: 'string', example: 'Quarterly sales analysis' },
                  type: { type: 'string', enum: ['sales', 'accounts', 'pipeline'], example: 'sales' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Report created successfully' },
        },
      },
    },
    '/api/admin/collections': {
      get: {
        tags: ['Admin'],
        summary: 'List MongoDB collections',
        description: 'Returns all collections with document counts and sample data',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    collections: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          count: { type: 'number' },
                          documents: { type: 'array' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Account: {
        type: 'object',
        properties: {
          accountid: { type: 'string', example: '1' },
          name: { type: 'string', example: 'Contoso Ltd' },
          revenue: { type: 'number', example: 5200000 },
          numberofemployees: { type: 'number', example: 250 },
          telephone1: { type: 'string', example: '+49 69 1234567' },
          emailaddress1: { type: 'string', example: 'contact@contoso.de' },
          websiteurl: { type: 'string', example: 'https://contoso.com' },
          address1_city: { type: 'string', example: 'Frankfurt' },
        },
      },
      Contact: {
        type: 'object',
        properties: {
          contactid: { type: 'string', example: '1' },
          fullname: { type: 'string', example: 'Anna Schmidt' },
          firstname: { type: 'string', example: 'Anna' },
          lastname: { type: 'string', example: 'Schmidt' },
          emailaddress1: { type: 'string', example: 'anna.schmidt@contoso.de' },
          telephone1: { type: 'string', example: '+49 69 1234567' },
          jobtitle: { type: 'string', example: 'CEO' },
        },
      },
      Opportunity: {
        type: 'object',
        properties: {
          opportunityid: { type: 'string', example: '1' },
          name: { type: 'string', example: 'Contoso ERP Implementation' },
          estimatedvalue: { type: 'number', example: 450000 },
          statecode: { type: 'number', enum: [0, 1, 2], description: '0=Open, 1=Won, 2=Lost' },
          estimatedclosedate: { type: 'string', format: 'date', example: '2026-04-15' },
        },
      },
      Report: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Q1 Sales Report' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['sales', 'accounts', 'pipeline'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'number', example: 1 },
          totalPages: { type: 'number', example: 1 },
          total: { type: 'number', example: 10 },
        },
      },
    },
  },
};
