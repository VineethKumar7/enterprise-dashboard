'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { ChevronDown, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
}

interface ApiSection {
  title: string;
  description: string;
  endpoints: Endpoint[];
}

const apiDocs: ApiSection[] = [
  {
    title: 'Analytics',
    description: 'Dashboard metrics and KPIs with caching',
    endpoints: [
      {
        method: 'GET',
        path: '/api/analytics',
        description: 'Get dashboard metrics (cached for 5 minutes)',
        response: `{
  "success": true,
  "data": {
    "totalAccounts": 8,
    "totalContacts": 10,
    "totalOpportunities": 12,
    "totalRevenue": 29150000,
    "revenueByMonth": [...],
    "opportunitiesByStage": [...],
    "topAccounts": [...]
  },
  "cached": true
}`,
      },
    ],
  },
  {
    title: 'Accounts',
    description: 'Company/Organization records from Dataverse',
    endpoints: [
      {
        method: 'GET',
        path: '/api/dataverse/accounts',
        description: 'List all accounts with pagination',
        params: [
          { name: 'limit', type: 'number', required: false, description: 'Results per page (default: 20)' },
          { name: 'offset', type: 'number', required: false, description: 'Skip N results (default: 0)' },
        ],
        response: `{
  "success": true,
  "data": [
    {
      "accountid": "1",
      "name": "Contoso Ltd",
      "revenue": 5200000,
      "telephone1": "+49 69 1234567",
      "emailaddress1": "contact@contoso.de"
    }
  ],
  "pagination": { "page": 1, "totalPages": 1, "total": 8 }
}`,
      },
      {
        method: 'POST',
        path: '/api/dataverse/accounts',
        description: 'Create a new account',
        body: [
          { name: 'name', type: 'string', required: true, description: 'Company name' },
          { name: 'revenue', type: 'number', required: false, description: 'Annual revenue' },
          { name: 'telephone1', type: 'string', required: false, description: 'Phone number' },
          { name: 'emailaddress1', type: 'string', required: false, description: 'Email address' },
        ],
        response: `{
  "success": true,
  "data": { "accountid": "new-id", "name": "New Company" }
}`,
      },
    ],
  },
  {
    title: 'Contacts',
    description: 'Individual contact records linked to accounts',
    endpoints: [
      {
        method: 'GET',
        path: '/api/dataverse/contacts',
        description: 'List all contacts with pagination',
        params: [
          { name: 'limit', type: 'number', required: false, description: 'Results per page (default: 20)' },
          { name: 'offset', type: 'number', required: false, description: 'Skip N results (default: 0)' },
        ],
        response: `{
  "success": true,
  "data": [
    {
      "contactid": "1",
      "fullname": "Anna Schmidt",
      "emailaddress1": "anna.schmidt@contoso.de",
      "jobtitle": "CEO"
    }
  ],
  "pagination": { "page": 1, "totalPages": 1, "total": 10 }
}`,
      },
    ],
  },
  {
    title: 'Opportunities',
    description: 'Sales opportunities with pipeline stages',
    endpoints: [
      {
        method: 'GET',
        path: '/api/dataverse/opportunities',
        description: 'List all opportunities with pagination',
        params: [
          { name: 'limit', type: 'number', required: false, description: 'Results per page (default: 20)' },
          { name: 'offset', type: 'number', required: false, description: 'Skip N results (default: 0)' },
        ],
        response: `{
  "success": true,
  "data": [
    {
      "opportunityid": "1",
      "name": "Contoso ERP Implementation",
      "estimatedvalue": 450000,
      "statecode": 0,
      "estimatedclosedate": "2026-04-15"
    }
  ],
  "pagination": { "page": 1, "totalPages": 1, "total": 12 }
}`,
      },
    ],
  },
  {
    title: 'Reports',
    description: 'Custom reports stored in MongoDB',
    endpoints: [
      {
        method: 'GET',
        path: '/api/reports',
        description: 'List all reports',
        response: `{
  "success": true,
  "data": [
    {
      "_id": "abc123",
      "title": "Q1 Sales Report",
      "type": "sales",
      "createdAt": "2026-03-31T09:00:00Z"
    }
  ]
}`,
      },
      {
        method: 'POST',
        path: '/api/reports',
        description: 'Create a new report',
        body: [
          { name: 'title', type: 'string', required: true, description: 'Report title' },
          { name: 'description', type: 'string', required: false, description: 'Report description' },
          { name: 'type', type: 'string', required: true, description: 'Report type (sales/accounts/pipeline)' },
        ],
        response: `{
  "success": true,
  "data": { "_id": "new-id", "title": "New Report" }
}`,
      },
    ],
  },
  {
    title: 'Admin',
    description: 'Database administration endpoints',
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/collections',
        description: 'List all MongoDB collections with documents',
        response: `{
  "success": true,
  "collections": [
    { "name": "accounts", "count": 8, "documents": [...] },
    { "name": "contacts", "count": 10, "documents": [...] }
  ]
}`,
      },
    ],
  },
];

const methodColors = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyResponse = () => {
    navigator.clipboard.writeText(endpoint.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
        <span className={`px-2 py-1 rounded text-xs font-bold ${methodColors[endpoint.method]}`}>
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
        <span className="text-sm text-gray-500 ml-auto">{endpoint.description}</span>
      </button>

      {expanded && (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
          {endpoint.params && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Query Parameters</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Required</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.params.map((param) => (
                    <tr key={param.name} className="border-t border-gray-200">
                      <td className="py-2 font-mono text-blue-600">{param.name}</td>
                      <td className="py-2 text-gray-600">{param.type}</td>
                      <td className="py-2">{param.required ? '✓' : '—'}</td>
                      <td className="py-2 text-gray-600">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {endpoint.body && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Request Body</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-2">Field</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Required</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.body.map((field) => (
                    <tr key={field.name} className="border-t border-gray-200">
                      <td className="py-2 font-mono text-blue-600">{field.name}</td>
                      <td className="py-2 text-gray-600">{field.type}</td>
                      <td className="py-2">{field.required ? '✓' : '—'}</td>
                      <td className="py-2 text-gray-600">{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Response</h4>
              <button
                onClick={copyResponse}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {endpoint.response}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div>
      <Header title="API Documentation" showSearch={false} />

      <div className="p-6 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">REST API Reference</h2>
          <p className="text-gray-600">
            All endpoints return JSON. Base URL: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code>
          </p>
        </div>

        <div className="space-y-8">
          {apiDocs.map((section) => (
            <div key={section.title}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
              <div className="space-y-3">
                {section.endpoints.map((endpoint) => (
                  <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Interview Tip</h3>
          <p className="text-sm text-blue-800">
            This documentation page is built into the app — no external tools like Swagger needed. 
            All endpoints follow RESTful conventions and return consistent JSON responses.
          </p>
        </div>
      </div>
    </div>
  );
}
