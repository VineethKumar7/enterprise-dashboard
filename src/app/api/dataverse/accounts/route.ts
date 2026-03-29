import { NextRequest, NextResponse } from 'next/server';
import { getDataverseClient } from '@/lib/dataverse';
import { ApiResponse, Account } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const top = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const orderby = searchParams.get('orderby') || 'name asc';

    const client = getDataverseClient();
    
    let filter: string | undefined;
    if (search) {
      filter = `contains(name, '${search}')`;
    }

    const result = await client.getAccounts({
      select: ['accountid', 'name', 'emailaddress1', 'telephone1', 'address1_city', 'revenue', 'createdon', 'modifiedon'],
      filter,
      orderby,
      top,
      skip,
      count: true,
    });

    const response: ApiResponse<Account[]> = {
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
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getDataverseClient();
    
    const id = await client.create<Account>('accounts', body);
    
    return NextResponse.json({ success: true, data: { accountid: id } }, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
