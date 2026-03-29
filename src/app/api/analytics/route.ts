import { NextResponse } from 'next/server';
import { getDataverseClient } from '@/lib/dataverse';
import { connectToDatabase, AnalyticsCache } from '@/lib/mongodb';
import { DashboardMetrics } from '@/types';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    await connectToDatabase();

    // Check cache first
    const cached = await AnalyticsCache.findOne({ key: 'dashboard_metrics' });
    if (cached && new Date(cached.expiresAt) > new Date()) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
      });
    }

    const client = getDataverseClient();

    // Fetch data in parallel
    const [accounts, contacts, opportunities, revenueData, stageData] = await Promise.all([
      client.getAccounts({ select: ['accountid'], count: true }),
      client.getContacts({ select: ['contactid'], count: true }),
      client.getOpportunities({ select: ['opportunityid'], count: true }),
      client.getAccountsRevenue(),
      client.getOpportunitiesByStage(),
    ]);

    // Get opportunities with dates for monthly breakdown
    const oppsWithDates = await client.getOpportunities({
      select: ['estimatedvalue', 'estimatedclosedate', 'statecode'],
      filter: 'statecode eq 1', // Won opportunities
      top: 500,
    });

    // Calculate revenue by month (last 12 months)
    const monthlyRevenue = new Map<string, number>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toISOString().slice(0, 7); // YYYY-MM
      monthlyRevenue.set(key, 0);
    }

    oppsWithDates.value.forEach(opp => {
      if (opp.estimatedclosedate) {
        const month = opp.estimatedclosedate.slice(0, 7);
        if (monthlyRevenue.has(month)) {
          monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + (opp.estimatedvalue || 0));
        }
      }
    });

    const revenueByMonth = Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    const metrics: DashboardMetrics = {
      totalAccounts: accounts['@odata.count'] || accounts.value.length,
      totalContacts: contacts['@odata.count'] || contacts.value.length,
      totalOpportunities: opportunities['@odata.count'] || opportunities.value.length,
      totalRevenue: revenueData.total,
      revenueByMonth,
      opportunitiesByStage: stageData,
      topAccounts: revenueData.byAccount,
    };

    // Cache the result
    await AnalyticsCache.findOneAndUpdate(
      { key: 'dashboard_metrics' },
      {
        key: 'dashboard_metrics',
        data: metrics,
        expiresAt: new Date(Date.now() + CACHE_TTL_MS),
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: metrics,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
