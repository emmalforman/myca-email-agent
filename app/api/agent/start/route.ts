import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { lookupPerson } from '@/lib/lookup';

export async function POST(request: Request) {
  try {
    const { text, userEmail } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Call Claude to classify and determine next step
    const response = await callClaude(text);

    // If lookup is needed, perform it
    if (response.type === 'lookup_needed' && response.lookup_needed) {
      const { role, company } = response.lookup_needed;
      const lookupResults = await lookupPerson(role, company);
      
      return NextResponse.json({
        ...response,
        lookup_results: lookupResults,
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Agent start error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}


