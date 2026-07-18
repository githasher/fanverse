// =============================================================================
// FANVERSE AI — Gemini API Client
// Handles chat, ticket OCR, and contextual responses via Gemini 2.5 Flash
// =============================================================================

import { GoogleGenAI, type Chat, type Content } from '@google/genai';
import type { StadiumState, UserProfile, TicketInfo, ChatMessage } from '@/types';
import { env } from './env';
import { logger } from './logger';
import {
  MODEL_ID,
  AI_TEMPERATURE,
  AI_TOP_P,
  AI_TOP_K,
  AI_MAX_OUTPUT_TOKENS,
  STADIUM_CAPACITY,
} from './constants';

let cachedClient: GoogleGenAI | null = null;

/**
 * Instantiates or retrieves the cached GoogleGenAI client singleton.
 * Validates API key presence at execution time.
 *
 * @returns GoogleGenAI client instance.
 */
function getClient(): GoogleGenAI {
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return cachedClient;
}

// -----------------------------------------------------------------------------
// System prompt — defines FANVERSE AI's personality and capabilities
// -----------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are FANVERSE AI, the official intelligent stadium assistant for the FIFA World Cup 2026™ at MetLife Stadium in East Rutherford, New Jersey.

## Your Role
You are a proactive, friendly, and deeply knowledgeable stadium concierge. You have real-time access to live stadium data including:
- Gate statuses, crowd levels, and wait times at all 8 stadium entrances
- Crowd density across all 12 stadium sections (A through L)
- Queue lengths and wait times at 24+ facilities (restrooms, food courts, merchandise shops, medical stations, baby care rooms)
- 17 international food vendors with menus, prices, dietary info, and current queue lengths
- Live weather conditions (temperature, wind, precipitation, UV index)
- Transport options (NJ Transit metro, bus, rideshare, parking availability)
- The current match-day phase (Before Match, Entering, Inside, Halftime, After Match)

## Dual Operational Modes
Depending on the user's active role, your personality and assistance focus shifts:
1. **Fan Mode**: Focus on personal logistics, finding seats, dietary-matched food vendors, short restrooms wait times, accessibility routing, and transportation.
2. **Staff/Organizer Mode**: Assist venue organizers and volunteer hosts. Answer operational questions (e.g. volunteer dispatches, crowd control, emergency safety procedures, dispatching clean-up/maintenance crews, or rerouting arriving spectators to quieter gates).

## Your Personality
- **Proactive**: Don't just answer questions — anticipate needs. If someone asks about their seat, also mention the nearest restroom and food options.
- **Contextual**: Use the current match phase, weather, and crowd data to give timely advice. At halftime, suggest the shortest food queues. Before the match, guide them to the best gate.
- **Inclusive**: Be mindful of accessibility needs. If a user has wheelchair access, always suggest accessible routes, gates, and facilities.
- **Sustainability-Focused**: Encourage fans to use GreenGoal recycling hubs (located in Sections F & K) and to prioritize transit (NJ Transit metro) to minimize carbon emissions. Suggest hydration stations to reduce plastic.
- **World Cup Spirit**: This is the biggest sporting event on earth! Match the excitement while being helpful. Use ⚽ and 🏟️ occasionally.
- **Concise**: Keep responses focused and actionable. Use bullet points for multiple options. Don't overwhelm with data.
- **Safety-First**: For emergencies or medical issues, always prioritise directing to the nearest medical station and stadium security.

## Response Guidelines
- When recommending gates, mention their current wait time and crowd level
- When suggesting food, consider dietary restrictions from the user profile
- Always mention accessibility features when relevant to the user
- If you don't have enough data to answer, say so honestly rather than guessing
- Format prices in USD
- Use 12-hour time format
- Distances should be described in walking time (e.g., "3 min walk from your seat")
- When giving directions, reference gate names, section letters, and level numbers

## Important Notes
- MetLife Stadium capacity: ${STADIUM_CAPACITY}
- The stadium is open-air (no roof) — weather matters!
- NJ Transit Meadowlands Rail is the primary public transport
- The stadium has 3 levels: 100 (Lower), 200 (Mezzanine), 300 (Upper)
- VIP areas are in Section L (East side)
- All medical stations are staffed with FIFA tournament medical teams`;

// -----------------------------------------------------------------------------
// Create a stateful chat session
// -----------------------------------------------------------------------------

/**
 * Creates a new Gemini chat session pre-loaded with the FANVERSE AI system prompt.
 * Use this for multi-turn conversations in the chat UI.
 *
 * @returns Promise resolving to a Gemini Chat session.
 */
export async function createFanverseChat(): Promise<Chat> {
  const client = getClient();

  const chat = client.chats.create({
    model: MODEL_ID,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: AI_TEMPERATURE,
      topP: AI_TOP_P,
      topK: AI_TOP_K,
      maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
    },
    history: [
      {
        role: 'user',
        parts: [{ text: 'Hello!' }],
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Welcome to MetLife Stadium! ⚽🏟️ I\'m FANVERSE AI, your personal World Cup stadium assistant. I can help you with:\n\n• 🚪 **Gate status** — find the fastest entrance\n• 🍔 **Food & drinks** — discover 17 international cuisines\n• 🚻 **Facilities** — shortest restroom queues\n• 🚇 **Transport** — metro, bus, rideshare info\n• 🎟️ **Ticket help** — scan your ticket for seat directions\n• ♿ **Accessibility** — accessible routes and facilities\n\nWhat can I help you with today?',
          },
        ],
      },
    ],
  });

  return chat;
}

// -----------------------------------------------------------------------------
// Ticket OCR via Gemini Vision
// -----------------------------------------------------------------------------

/**
 * Analyses a ticket image using Gemini Vision and extracts structured seat info.
 * Returns a TicketInfo object parsed from the model's JSON response.
 *
 * @param imageBase64 The base64 string of the ticket.
 * @returns Promise resolving to TicketInfo.
 */
export async function analyzeTicket(imageBase64: string): Promise<TicketInfo> {
  const client = getClient();

  const prompt = `You are a ticket scanner for FIFA World Cup 2026™ at MetLife Stadium. 
Analyse this ticket image and extract the following information as a JSON object:

{
  "matchId": "string — the match identifier (e.g. 'M48')",
  "section": "string — seating section letter or number",
  "row": "string — row number or letter",
  "seat": "string — seat number",
  "gate": "string — recommended entry gate",
  "matchName": "string — the match name (e.g. 'Argentina vs France')",
  "date": "string — match date in YYYY-MM-DD format",
  "time": "string — kickoff time in HH:MM format (24h)"
}

If you cannot read a field clearly, make a reasonable inference based on the visible information.
Respond ONLY with the JSON object, no markdown fences, no explanation.`;

  const response = await client.models.generateContent({
    model: MODEL_ID,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
        ],
      },
    ],
  });

  const text = response.text?.trim() ?? '';
  const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

  try {
    const parsed: TicketInfo = JSON.parse(jsonStr);
    return parsed;
  } catch (err: unknown) {
    logger.error('AnalyzeTicketOCR', err);
    // Fallback: return a default ticket if parsing fails
    return {
      matchId: 'UNKNOWN',
      section: 'A',
      row: '1',
      seat: '1',
      gate: 'Gate A',
      matchName: 'FIFA World Cup 2026™ Match',
      date: '2026-07-19',
      time: '18:00',
    };
  }
}

// -----------------------------------------------------------------------------
// Smart contextual response (using Function Calling / Tools)
// -----------------------------------------------------------------------------

const stadiumTools = [
  {
    functionDeclarations: [
      {
        name: 'getStadiumTelemetry',
        description: 'Get live wait times, queues, gates, food vendors, weather, and transport data for the stadium.',
        parameters: {
          type: 'OBJECT',
          properties: {
            dataType: {
              type: 'STRING',
              description: 'Type of data to fetch',
              enum: ['gates', 'food', 'facilities', 'transport', 'weather', 'zones'],
            },
          },
          required: ['dataType'],
        },
      },
    ],
  },
];

/**
 * Sends a user message to Gemini using Tools (Function Calling) to fetch
 * contextual stadium telemetry only when needed, saving tokens and reducing hallucinations.
 *
 * @param userMessage Message content from user.
 * @param stadiumState Current sensory telemetry of stadium.
 * @param userProfile Details about active user profile.
 * @param history Recent conversation logs.
 * @returns Promise resolving to response text.
 */
export async function getSmartResponse(
  userMessage: string,
  stadiumState: StadiumState,
  userProfile: UserProfile,
  history: ChatMessage[] = []
): Promise<string> {
  const client = getClient();

  const systemInstruction = `${SYSTEM_PROMPT}

## User Profile
- Name: ${userProfile.name || 'Fan'}
- Role: ${userProfile.role || 'fan'} (Dual Operational Modes: if 'staff', you are a Stadium Operations Coordinator for crowd control and volunteer dispatching)
- Language: ${userProfile.language || 'English'}
- Sustainability Points: ${userProfile.sustainabilityPoints} (arriving via Metro saves carbon and adds points)
- Accessibility: wheelchair=${userProfile.accessibility.wheelchair}, visual=${userProfile.accessibility.visualImpairment}, hearing=${userProfile.accessibility.hearingImpairment}, elderly=${userProfile.accessibility.elderly}
- Dietary restrictions: ${userProfile.preferences.dietaryRestrictions.length > 0 ? userProfile.preferences.dietaryRestrictions.join(', ') : 'None'}
- Traveling with: ${userProfile.preferences.travelingWith}
- Favorite team: ${userProfile.preferences.favoriteTeam || 'Not specified'}
- Ticket: ${userProfile.ticket ? `Section ${userProfile.ticket.section}, Row ${userProfile.ticket.row}, Seat ${userProfile.ticket.seat} (${userProfile.ticket.matchName})` : 'Not scanned yet'}
- Current phase: ${userProfile.matchDayPhase}

Respond helpfully and concisely in the user's preferred language. Use the 'getStadiumTelemetry' tool to fetch live wait times, queues, or gate data only when necessary to answer the user's question. If the user is 'staff', coordinate dispatches or redirect crowd flows professionally.`;

  const formattedHistory = history.map((msg: ChatMessage) => {
    const role = msg.role === 'user' ? 'user' : 'model';
    const rawMsg = msg as unknown as { parts?: Array<{ text?: string }> };
    if (rawMsg.parts && Array.isArray(rawMsg.parts)) {
      return {
        role,
        parts: rawMsg.parts.map((p) => ({ text: p.text || '' })),
      };
    }
    return {
      role,
      parts: [{ text: msg.content || '' }],
    };
  });

  const contents: Content[] = [
    ...formattedHistory,
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  const config = {
    systemInstruction,
    tools: stadiumTools,
    temperature: AI_TEMPERATURE,
    topP: AI_TOP_P,
    topK: AI_TOP_K,
    maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
  };

  let response = await client.models.generateContent({
    model: MODEL_ID,
    contents,
    config: config as any,
  });

  // Handle consecutive function calls in a loop (up to a limit of 5 to avoid infinite loops)
  let loopCount = 0;
  while (response.functionCalls && response.functionCalls.length > 0 && loopCount < 5) {
    loopCount++;
    const call = response.functionCalls[0];
    if (!call) break;
    const args = call.args as { dataType: string };
    let resultData: unknown = {};

    switch (args.dataType) {
      case 'gates': resultData = stadiumState.gates; break;
      case 'food': resultData = stadiumState.foodVendors; break;
      case 'facilities': resultData = stadiumState.facilities; break;
      case 'transport': resultData = stadiumState.transport; break;
      case 'weather': resultData = stadiumState.weather; break;
      case 'zones': resultData = stadiumState.zones; break;
      default: resultData = { error: 'Unknown data type' };
    }

    if (response.candidates?.[0]?.content) {
      contents.push(response.candidates[0].content);
    }

    contents.push({
      role: 'tool',
      parts: [
        {
          functionResponse: {
            name: call.name,
            response: { result: JSON.stringify(resultData) },
          },
        },
      ],
    });

    response = await client.models.generateContent({
      model: MODEL_ID,
      contents,
      config: config as any,
    });
  }

  return response.text?.trim() ?? "I apologise — I wasn't able to generate a response. Please try again.";
}
