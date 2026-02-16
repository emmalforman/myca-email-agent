import { NextResponse } from 'next/server';
import { getGmailTokens } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json({ connected: false });
    }

    const tokens = await getGmailTokens(userEmail);
    return NextResponse.json({ connected: !!tokens });
  } catch (error) {
    return NextResponse.json({ connected: false });
  }
}



