'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TopAccountsTableProps {
  accounts: { name: string; revenue: number }[];
}

export function TopAccountsTable({ accounts }: TopAccountsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const maxRevenue = Math.max(...accounts.map(a => a.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Accounts by Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account, index) => (
            <div key={account.name} className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {account.name}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatCurrency(account.revenue)}
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(account.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
