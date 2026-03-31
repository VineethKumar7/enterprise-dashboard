'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading';
import { Building2, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { Account, ApiResponse } from '@/types';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter accounts based on search
  const filteredAccounts = accounts.filter((account) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      account.name?.toLowerCase().includes(query) ||
      account.emailaddress1?.toLowerCase().includes(query) ||
      account.telephone1?.toLowerCase().includes(query) ||
      account.address1_city?.toLowerCase().includes(query)
    );
  });

  const fetchAccounts = useCallback(async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/dataverse/accounts?limit=20&offset=${(page - 1) * 20}`);
      const data: ApiResponse<Account[]> = await response.json();

      if (data.success && data.data) {
        setAccounts(data.data);
        if (data.pagination) {
          setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
        }
      } else {
        setError(data.error || 'Failed to fetch accounts');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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
        <LoadingState message="Loading accounts..." />
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Accounts" 
        onRefresh={() => fetchAccounts(pagination.page, true)}
        isRefreshing={refreshing}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="p-6">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchAccounts()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccounts.map((account) => (
                <Card key={account.accountid} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{account.name}</h3>
                      
                      <div className="mt-3 space-y-2">
                        {account.emailaddress1 && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{account.emailaddress1}</span>
                          </div>
                        )}
                        {account.telephone1 && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="h-4 w-4" />
                            <span>{account.telephone1}</span>
                          </div>
                        )}
                        {account.address1_city && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{account.address1_city}</span>
                          </div>
                        )}
                      </div>

                      {account.revenue && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(account.revenue)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => fetchAccounts(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchAccounts(pagination.page + 1)}
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
