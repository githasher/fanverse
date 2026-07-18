import { NextResponse } from 'next/server';
import { analyzeTicket } from '@/lib/gemini';
import { validateScanRequest } from '@/lib/validation';

/**
 * Handles incoming ticket scans using OCR base64 images.
 * Passes the image payload to Gemini Vision to extract seating specifications.
 *
 * @param req Incoming HTTP Request containing the base64-encoded image.
 * @returns Promise<NextResponse> containing the extracted ticket metadata or validation error.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { imageBase64 } = body;

    const validation = validateScanRequest(imageBase64);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Bad Request' },
        { status: 400 }
      );
    }

    const ticketInfo = await analyzeTicket(imageBase64);

    return NextResponse.json({ ticket: ticketInfo });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Scan API route error:', error);
    return NextResponse.json(
      { error: errorMsg || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
