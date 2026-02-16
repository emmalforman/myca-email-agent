import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import type { LookupResult } from '@/types';

export async function POST(request: Request) {
  try {
    const { text, selectedPerson, previousFeedback } = await request.json();

    if (!text || !selectedPerson) {
      return NextResponse.json(
        { error: 'Text and selectedPerson are required' },
        { status: 400 }
      );
    }

    const response = await callClaude(text, {
      selectedPerson: selectedPerson as LookupResult,
      previousFeedback,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Agent choose error:', error);
    return NextResponse.json(
      { error: 'Failed to process selection' },
      { status: 500 }
    );
  }
}



