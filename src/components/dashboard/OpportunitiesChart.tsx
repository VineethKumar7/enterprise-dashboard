'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface OpportunitiesChartProps {
  data: { stage: string; count: number; value: number }[];
}

const COLORS = {
  Open: '#3b82f6',
  Won: '#22c55e',
  Lost: '#ef4444',
};

export function OpportunitiesChart({ data }: OpportunitiesChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opportunities by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis 
                type="number"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category"
                dataKey="stage"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === 'value' ? formatCurrency(Number(value)) : value,
                  name === 'value' ? 'Total Value' : 'Count'
                ]}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry) => (
                  <Cell 
                    key={entry.stage} 
                    fill={COLORS[entry.stage as keyof typeof COLORS] || '#6b7280'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6">
          {data.map((item) => (
            <div key={item.stage} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[item.stage as keyof typeof COLORS] || '#6b7280' }}
              />
              <span className="text-sm text-gray-600">
                {item.stage}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
