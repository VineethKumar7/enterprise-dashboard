'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading';
import { TrendingUp, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Opportunity, ApiResponse } from '@/types';
import { format, parseISO } from 'date-fns';

const statusConfig = {
  0: { label: 'Open', color: 'blue', icon: Clock },
  1: { label: 'Won', color: 'green', icon: CheckCircle },
  2: { label: 'Lost', color: 'red', icon: XCircle },
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchOpportunities = useCallback(async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let url = `/api/dataverse/opportunities?limit=20&offset=${(page - 1) * 20}`;
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }

      const response = await fetch(url);
      const data: ApiResponse<Opportunity[]> = await response.json();

      if (data.success && data.data) {
        setOpportunities(data.data);
        if (data.pagination) {
          setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
        }
      } else {
        setError(data.error || 'Failed to fetch opportunities');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading opportunities..." />
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Opportunities" 
        onRefresh={() => fetchOpportunities(pagination.page, true)}
        isRefreshing={refreshing}
      />
      
      <div className="p-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'open', 'won', 'lost'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setPagination({ page: 1, totalPages: 1 });
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchOpportunities()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.map((opp) => {
                const status = statusConfig[opp.statecode as keyof typeof statusConfig] || statusConfig[0];
                const StatusIcon = status.icon;

                return (
                  <Card key={opp.opportunityid} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          status.color === 'blue' ? 'bg-blue-50' :
                          status.color === 'green' ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          <TrendingUp className={`h-6 w-6 ${
                            status.color === 'blue' ? 'text-blue-600' :
                            status.color === 'green' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{opp.name}</h3>
                          
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(opp.estimatedvalue)}
                              </span>
                            </div>
                            {opp.estimatedclosedate && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Close: {format(parseISO(opp.estimatedclosedate), 'MMM d, yyyy')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                        status.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        status.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => fetchOpportunities(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchOpportunities(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
