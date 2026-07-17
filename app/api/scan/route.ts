import { NextResponse } from 'next/server';
import { analyzeTicket } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing required parameter: imageBase64' },
        { status: 400 }
      );
    }

    const ticketInfo = await analyzeTicket(imageBase64);

    return NextResponse.json({ ticket: ticketInfo });
  } catch (error: any) {
    console.error('Scan API route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
