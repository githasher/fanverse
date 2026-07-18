import { NextResponse } from 'next/server';
import { getSmartResponse } from '@/lib/gemini';
import { validateChatRequest, validateChatHistory, sanitizeInput } from '@/lib/validation';
import { checkRateLimit, getClientIp, CHAT_RATE_LIMIT } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

/**
 * Handles incoming chat messages from the user dashboard.
 * Applies rate limiting, input validation, XSS sanitization, and
 * executes Gemini AI queries with full stadium context.
 *
 * @param req Incoming HTTP Request containing message, stadiumState, userProfile, and history.
 * @returns Promise<NextResponse> containing the AI response text or error.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // CSRF Origin verification check
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json({ error: 'CSRF Protection: Forbidden origin request.' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'CSRF Protection: Invalid origin format.' }, { status: 403 });
      }
    }

    // Rate limiting check
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`chat:${clientIp}`, CHAT_RATE_LIMIT);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before sending another message.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)),
            'X-RateLimit-Remaining': String(rateCheck.remaining),
          },
        }
      );
    }

    const body = await req.json();
    const { message, stadiumState, userProfile, history } = body;

    // Validate primary fields
    const validation = validateChatRequest(message, stadiumState, userProfile);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error ?? 'Bad Request' },
        { status: 400 }
      );
    }

    // Validate history array
    const historyValidation = validateChatHistory(history);
    if (!historyValidation.isValid) {
      return NextResponse.json(
        { error: historyValidation.error ?? 'Invalid history format' },
        { status: 400 }
      );
    }

    // Sanitize user message
    const sanitizedMessage = sanitizeInput(message);

    const responseText = await getSmartResponse(
      sanitizedMessage,
      stadiumState,
      userProfile,
      history ?? []
    );

    return NextResponse.json({ response: responseText });
  } catch (error: unknown) {
    logger.error('ChatAPI', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
