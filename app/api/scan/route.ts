import { NextResponse } from 'next/server';
import { analyzeTicket } from '@/lib/gemini';
import { validateScanRequest } from '@/lib/validation';
import { checkRateLimit, getClientIp, SCAN_RATE_LIMIT } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

/**
 * Handles incoming ticket scans using base64-encoded images.
 * Applies rate limiting, validates image format and size, then passes
 * the payload to Gemini Vision for OCR extraction.
 *
 * @param req Incoming HTTP Request containing the base64-encoded image.
 * @returns Promise<NextResponse> containing extracted ticket metadata or error.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Rate limiting check
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`scan:${clientIp}`, SCAN_RATE_LIMIT);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many scan requests. Please wait before scanning again.' },
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
    const { imageBase64 } = body;

    const validation = validateScanRequest(imageBase64);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error ?? 'Bad Request' },
        { status: 400 }
      );
    }

    const ticketInfo = await analyzeTicket(imageBase64);

    return NextResponse.json({ ticket: ticketInfo });
  } catch (error: unknown) {
    logger.error('ScanAPI', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
