import { NextResponse } from 'next/server';
import { getSmartResponse } from '@/lib/gemini';
import { validateChatRequest } from '@/lib/validation';

/**
 * Handles incoming chat messages from the user dashboard.
 * Merges match-day stadium sensory context, maps chat history,
 * and executes Gemini 3.5 Flash queries.
 *
 * @param req Incoming HTTP Request containing message, stadiumState, userProfile, and history.
 * @returns Promise<NextResponse> containing the AI response text or validation error.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { message, stadiumState, userProfile, history } = body;

    const validation = validateChatRequest(message, stadiumState, userProfile);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Bad Request' },
        { status: 400 }
      );
    }

    const responseText = await getSmartResponse(message, stadiumState, userProfile, history || []);

    return NextResponse.json({ response: responseText });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Chat API route error:', error);
    return NextResponse.json(
      { error: errorMsg || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
