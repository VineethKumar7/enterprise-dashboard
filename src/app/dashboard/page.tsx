'use client';

import { useEffect, useState, useCallback } from 'react';
import { Building2, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OpportunitiesChart } from '@/components/dashboard/OpportunitiesChart';
import { TopAccountsTable } from '@/components/dashboard/TopAccountsTable';
import { LoadingState } from '@/components/ui/loading';
import { DashboardMetrics } from '@/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/analytics');
      const data = await response.json();

      if (data.success) {
        setMetrics(data.data);
      } else {
        setError(data.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchMetrics()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div>
      <Header 
        title="Dashboard" 
        onRefresh={() => fetchMetrics(true)}
        isRefreshing={refreshing}
      />
      
      <div className="p-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Accounts"
            value={metrics.totalAccounts.toLocaleString()}
            icon={Building2}
            color="blue"
          />
          <MetricCard
            title="Total Contacts"
            value={metrics.totalContacts.toLocaleString()}
            icon={Users}
            color="green"
          />
          <MetricCard
            title="Opportunities"
            value={metrics.totalOpportunities.toLocaleString()}
            icon={TrendingUp}
            color="purple"
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            icon={DollarSign}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <RevenueChart data={metrics.revenueByMonth} />
          <OpportunitiesChart data={metrics.opportunitiesByStage} />
        </div>

        {/* Top Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopAccountsTable accounts={metrics.topAccounts} />
        </div>
      </div>
    </div>
  );
}
