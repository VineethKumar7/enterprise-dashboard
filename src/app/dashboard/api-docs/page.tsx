'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="swagger-wrapper">
        <SwaggerUI url="/api/swagger" />
      </div>
      <style jsx global>{`
        .swagger-wrapper {
          padding: 20px;
        }
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-ui .info .title {
          font-size: 2rem;
          font-weight: bold;
        }
        .swagger-ui .scheme-container {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }
        .swagger-ui .opblock-tag {
          font-size: 1.2rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .swagger-ui .opblock {
          border-radius: 8px;
          margin: 10px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .swagger-ui .opblock .opblock-summary {
          padding: 10px 15px;
        }
        .swagger-ui .opblock.opblock-get {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }
        .swagger-ui .opblock.opblock-get .opblock-summary {
          border-color: #10b981;
        }
        .swagger-ui .opblock.opblock-post {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }
        .swagger-ui .opblock.opblock-post .opblock-summary {
          border-color: #3b82f6;
        }
        .swagger-ui .btn.execute {
          background: #3b82f6;
          border-color: #3b82f6;
        }
        .swagger-ui .btn.execute:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}
