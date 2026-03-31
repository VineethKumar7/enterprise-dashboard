'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

export default function ApiDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // @ts-expect-error - Redoc is loaded via script
    if (typeof window !== 'undefined' && window.Redoc && containerRef.current) {
      // @ts-expect-error - Redoc global
      window.Redoc.init('/api/swagger', {
        scrollYOffset: 0,
        theme: {
          colors: {
            primary: { main: '#3b82f6' },
          },
          typography: {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            headings: { fontFamily: 'system-ui, -apple-system, sans-serif' },
          },
          sidebar: {
            backgroundColor: '#1f2937',
            textColor: '#f3f4f6',
          },
        },
      }, containerRef.current);
    }
  }, []);

  return (
    <>
      <Script 
        src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"
        onLoad={() => {
          // @ts-expect-error - Redoc global
          if (window.Redoc && containerRef.current) {
            // @ts-expect-error - Redoc global
            window.Redoc.init('/api/swagger', {
              scrollYOffset: 0,
              hideDownloadButton: false,
              theme: {
                colors: {
                  primary: { main: '#3b82f6' },
                },
                typography: {
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  headings: { fontFamily: 'system-ui, -apple-system, sans-serif' },
                },
                sidebar: {
                  backgroundColor: '#1f2937',
                  textColor: '#f3f4f6',
                },
                rightPanel: {
                  backgroundColor: '#111827',
                },
              },
            }, containerRef.current);
          }
        }}
      />
      <div ref={containerRef} className="min-h-screen" />
    </>
  );
}
