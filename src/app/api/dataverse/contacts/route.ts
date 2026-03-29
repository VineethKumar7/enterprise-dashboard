import { NextRequest, NextResponse } from 'next/server';
import { getDataverseClient } from '@/lib/dataverse';
import { ApiResponse, Contact } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const top = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const accountId = searchParams.get('accountId');

    const client = getDataverseClient();
    
    const filters: string[] = [];
    if (search) {
      filters.push(`contains(fullname, '${search}')`);
    }
    if (accountId) {
      filters.push(`_parentcustomerid_value eq ${accountId}`);
    }

    const result = await client.getContacts({
      select: ['contactid', 'fullname', 'firstname', 'lastname', 'emailaddress1', 'telephone1', 'jobtitle', '_parentcustomerid_value'],
      filter: filters.length > 0 ? filters.join(' and ') : undefined,
      orderby: 'fullname asc',
      top,
      skip,
      count: true,
    });

    const response: ApiResponse<Contact[]> = {
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
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
