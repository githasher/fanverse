import { NextResponse } from 'next/server';
import { getSmartResponse } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { message, stadiumState, userProfile, history } = await req.json();

    if (!message || !stadiumState || !userProfile) {
      return NextResponse.json(
        { error: 'Missing required parameters: message, stadiumState, userProfile' },
        { status: 400 }
      );
    }

    const responseText = await getSmartResponse(message, stadiumState, userProfile, history || []);

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error('Chat API route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
