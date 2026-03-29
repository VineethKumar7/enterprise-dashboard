import { NextRequest, NextResponse } from 'next/server';
import { getDataverseClient } from '@/lib/dataverse';
import { ApiResponse, Opportunity } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const top = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // open, won, lost
    const accountId = searchParams.get('accountId');

    const client = getDataverseClient();
    
    const filters: string[] = [];
    
    if (status) {
      const statusMap: Record<string, number> = { open: 0, won: 1, lost: 2 };
      if (statusMap[status] !== undefined) {
        filters.push(`statecode eq ${statusMap[status]}`);
      }
    }
    
    if (accountId) {
      filters.push(`_parentaccountid_value eq ${accountId}`);
    }

    const result = await client.getOpportunities({
      select: ['opportunityid', 'name', 'estimatedvalue', 'estimatedclosedate', 'statecode', 'statuscode', '_parentaccountid_value', '_parentcontactid_value'],
      filter: filters.length > 0 ? filters.join(' and ') : undefined,
      orderby: 'estimatedvalue desc',
      top,
      skip,
      count: true,
    });

    const response: ApiResponse<Opportunity[]> = {
      success: true,
      data: result.value,
      pagination: {
        page: Math.floor(skip / top) + 1,
        limit: top,
        total: result['@odata.count'] || result.value.length,
        totalPages: Math.ceil((result['@odata.count'] || result.value.length) / top),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}
