'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading';
import { FileBarChart, Plus, Calendar, Filter } from 'lucide-react';
import { Report, ApiResponse } from '@/types';
import { format } from 'date-fns';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchReports = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/reports');
      const data: ApiResponse<Report[]> = await response.json();

      if (data.success && data.data) {
        setReports(data.data);
      } else {
        setError(data.error || 'Failed to fetch reports');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const typeColors = {
    sales: 'bg-green-100 text-green-700',
    accounts: 'bg-blue-100 text-blue-700',
    opportunities: 'bg-purple-100 text-purple-700',
    custom: 'bg-gray-100 text-gray-700',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading reports..." />
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Reports" 
        onRefresh={() => fetchReports(true)}
        isRefreshing={refreshing}
      />
      
      <div className="p-6">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Report
          </button>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchReports()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileBarChart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports yet</h3>
            <p className="text-gray-500 mb-6">Create your first report to get started</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Create Report
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report._id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <FileBarChart className="h-5 w-5 text-purple-600" />
                      </div>
                      <CardTitle className="text-base">{report.title}</CardTitle>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[report.type]}`}>
                      {report.type}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {report.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{report.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Created {format(new Date(report.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal (simplified) */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Create Report</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  const response = await fetch('/api/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: formData.get('title'),
                      description: formData.get('description'),
                      type: formData.get('type'),
                    }),
                  });
                  if (response.ok) {
                    setShowCreateModal(false);
                    fetchReports();
                  }
                } catch (err) {
                  console.error('Error creating report:', err);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      name="title"
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Report title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Report description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sales">Sales</option>
                      <option value="accounts">Accounts</option>
                      <option value="opportunities">Opportunities</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
