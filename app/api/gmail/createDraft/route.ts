import { NextResponse } from 'next/server';
import { getGmailTokens } from '@/lib/supabase';
import { createDraft } from '@/lib/gmail';
import { logEmailToNotion } from '@/lib/notion';
import type { DraftResponse, LookupResult } from '@/types';

export async function POST(request: Request) {
  try {
    const { 
      to, 
      subject, 
      body, 
      tag, 
      userEmail,
      originalInput,
      selectedPerson,
      questions,
      answers,
    } = await request.json();

    if (!to || !subject || !body || !tag || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tokens = await getGmailTokens(userEmail);
    if (!tokens) {
      return NextResponse.json(
        { error: 'Gmail not connected. Please connect your Gmail account.' },
        { status: 401 }
      );
    }

    const draft = await createDraft(tokens, to, subject, body, tag);

    // Log to Notion (optional, won't fail if not configured)
    if (originalInput) {
      const notionDraft: DraftResponse = { to, subject, body, mode: 'person_of_interest', tag };
      await logEmailToNotion(
        originalInput,
        notionDraft,
        selectedPerson as LookupResult | null,
        questions,
        answers
      );
    }

    return NextResponse.json({
      success: true,
      draftId: draft.id,
      messageId: draft.message?.id,
    });
  } catch (error) {
    console.error('Create draft error:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}

