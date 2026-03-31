'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Database, FileJson, RefreshCw } from 'lucide-react';

interface CollectionData {
  name: string;
  count: number;
  documents: Record<string, unknown>[];
}

export default function AdminPage() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/collections');
      const data = await response.json();
      if (data.success) {
        setCollections(data.collections);
        if (data.collections.length > 0 && !selectedCollection) {
          setSelectedCollection(data.collections[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedData = collections.find(c => c.name === selectedCollection);

  return (
    <div>
      <Header title="Database Admin" onRefresh={fetchData} isRefreshing={loading} />
      
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Database</p>
                <p className="text-lg font-semibold">enterprise-dashboard</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileJson className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Collections</p>
                <p className="text-lg font-semibold">{collections.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Documents</p>
                <p className="text-lg font-semibold">
                  {collections.reduce((sum, c) => sum + c.count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Collections List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Collections</h3>
            <div className="space-y-2">
              {collections.map((col) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedCollection(col.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCollection === col.name
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{col.name}</span>
                    <span className={`text-sm ${
                      selectedCollection === col.name ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {col.count}
                    </span>
                  </div>
                </button>
              ))}
              {collections.length === 0 && !loading && (
                <p className="text-gray-500 text-sm">No collections found</p>
              )}
            </div>
          </div>

          {/* Documents View */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              {selectedCollection ? `${selectedCollection} Documents` : 'Select a collection'}
            </h3>
            
            {selectedData && selectedData.documents.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-auto">
                {selectedData.documents.map((doc, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(doc, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No documents in this collection</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
