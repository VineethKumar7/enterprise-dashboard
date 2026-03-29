import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Report } from '@/lib/mongodb';
import { ApiResponse, Report as ReportType } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');

    const query: Record<string, unknown> = {};
    if (type) {
      query.type = type;
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Report.countDocuments(query),
    ]);

    const response: ApiResponse<ReportType[]> = {
      success: true,
      data: reports as ReportType[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    const report = await Report.create({
      ...body,
      createdBy: body.createdBy || 'system',
    });

    return NextResponse.json(
      { success: true, data: report },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
