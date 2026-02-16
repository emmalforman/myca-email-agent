import { NextResponse } from 'next/server';
import { draftSubstackPost } from '@/lib/claude-substack';

export async function POST(request: Request) {
  try {
    const { idea, tone, length, notes } = await request.json();

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    // Draft the post with Claude
    const post = await draftSubstackPost(idea, { tone, length, notes });

    // Note: Substack doesn't have a public API, so we just return the content
    // User will copy/paste into Substack manually

    return NextResponse.json({
      success: true,
      post: {
        title: post.title,
        subtitle: post.subtitle,
        body: post.body,
        tags: post.tags,
      },
    });
  } catch (error: any) {
    console.error('Substack draft error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to draft Substack post' },
      { status: 500 }
    );
  }
}

