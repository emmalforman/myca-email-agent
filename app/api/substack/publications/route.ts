import { NextResponse } from 'next/server';
import { getSubstackPublication } from '@/lib/substack';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    const publications = await getSubstackPublication(apiKey);
    
    return NextResponse.json({
      success: true,
      publications: publications.data || publications,
    });
  } catch (error: any) {
    console.error('Substack publications error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch publications' },
      { status: 500 }
    );
  }
}


