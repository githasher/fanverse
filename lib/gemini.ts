// =============================================================================
// FANVERSE AI — Gemini API Client
// Handles chat, ticket OCR, and contextual responses via Gemini 2.5 Flash
// =============================================================================

import { GoogleGenAI, type Chat, type Content } from '@google/genai';
import type { StadiumState, UserProfile, TicketInfo } from '@/types';

// -----------------------------------------------------------------------------
// Initialise the Gemini client
// -----------------------------------------------------------------------------

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function getClient(): GoogleGenAI {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to .env.local or your environment.'
    );
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

const MODEL_ID = 'gemini-3.5-flash';

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

## Your Personality
- **Proactive**: Don't just answer questions — anticipate needs. If someone asks about their seat, also mention the nearest restroom and food options.
- **Contextual**: Use the current match phase, weather, and crowd data to give timely advice. At halftime, suggest the shortest food queues. Before the match, guide them to the best gate.
- **Inclusive**: Be mindful of accessibility needs. If a user has wheelchair access, always suggest accessible routes, gates, and facilities.
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
- MetLife Stadium capacity: 82,500
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
 */
export async function createFanverseChat(): Promise<Chat> {
  const client = getClient();

  const chat = client.chats.create({
    model: MODEL_ID,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
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

  // Strip any accidental markdown fences
  const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

  try {
    const parsed: TicketInfo = JSON.parse(jsonStr);
    return parsed;
  } catch {
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
// Smart contextual response
// -----------------------------------------------------------------------------

/**
 * Sends a user message along with full stadium context to Gemini and returns
 * an intelligent, contextual response.
 */
export async function getSmartResponse(
  userMessage: string,
  stadiumState: StadiumState,
  userProfile: UserProfile,
  history: any[] = []
): Promise<string> {
  const client = getClient();

  // Build a compact context summary to keep token usage reasonable
  const contextSummary = buildContextSummary(stadiumState, userProfile);

  const systemInstruction = `${SYSTEM_PROMPT}

## Current Stadium Context
${contextSummary}

## User Profile
- Name: ${userProfile.name || 'Fan'}
- Language: ${userProfile.language || 'English'}
- Accessibility: wheelchair=${userProfile.accessibility.wheelchair}, visual=${userProfile.accessibility.visualImpairment}, hearing=${userProfile.accessibility.hearingImpairment}, elderly=${userProfile.accessibility.elderly}
- Dietary restrictions: ${userProfile.preferences.dietaryRestrictions.length > 0 ? userProfile.preferences.dietaryRestrictions.join(', ') : 'None'}
- Traveling with: ${userProfile.preferences.travelingWith}
- Favorite team: ${userProfile.preferences.favoriteTeam || 'Not specified'}
- Ticket: ${userProfile.ticket ? `Section ${userProfile.ticket.section}, Row ${userProfile.ticket.row}, Seat ${userProfile.ticket.seat} (${userProfile.ticket.matchName})` : 'Not scanned yet'}
- Current phase: ${userProfile.matchDayPhase}

Respond helpfully and concisely in the user's preferred language. Use the live data above to give specific, actionable advice.`;

  // Format history messages to match content objects format if they don't already
  const formattedHistory = history.map((msg: any) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: typeof msg.parts === 'string' ? [{ text: msg.parts }] : msg.parts,
  }));

  const response = await client.models.generateContent({
    model: MODEL_ID,
    contents: [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ],
    config: {
      systemInstruction,
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
    },
  });

  return response.text?.trim() ?? 'I apologise — I wasn\'t able to generate a response. Please try again.';
}

// -----------------------------------------------------------------------------
// Context builder — distils StadiumState into a concise text block
// -----------------------------------------------------------------------------

function buildContextSummary(state: StadiumState, profile: UserProfile): string {
  const { gates, zones, facilities, foodVendors, weather, transport, phase } = state;

  // Gates summary
  const gatesSummary = gates
    .map(
      (g) =>
        `${g.name}: ${g.status.toUpperCase()}, crowd ${Math.round(g.crowdLevel * 100)}%, wait ${g.waitMinutes} min${g.accessibleEntry ? ' ♿' : ''}`
    )
    .join('\n');

  // Top 3 busiest zones
  const sortedZones = [...zones].sort((a, b) => b.crowdDensity - a.crowdDensity);
  const zonesSummary = sortedZones
    .slice(0, 5)
    .map((z) => `${z.name}: ${Math.round(z.crowdDensity * 100)}% density, ${z.temperature}°F`)
    .join('\n');

  // Facility queues — only show ones with notable waits
  const busyFacilities = facilities
    .filter((f) => f.waitMinutes > 3)
    .sort((a, b) => b.waitMinutes - a.waitMinutes)
    .slice(0, 8)
    .map((f) => `${f.name} (${f.type}): ${f.queueLength} people, ~${f.waitMinutes} min wait`)
    .join('\n');

  // Food vendors — sorted by shortest queue
  const sortedFood = [...foodVendors].sort((a, b) => a.waitMinutes - b.waitMinutes);
  const foodSummary = sortedFood
    .slice(0, 8)
    .map(
      (v) =>
        `${v.name} (${v.cuisine}): ${v.waitMinutes} min wait, $${v.priceRange.min}-$${v.priceRange.max}${v.dietaryTags.length ? ` [${v.dietaryTags.join(', ')}]` : ''}`
    )
    .join('\n');

  // Weather
  const weatherStr = `${weather.temperature}°F (feels ${weather.feelsLike}°F), ${weather.condition.replace('_', ' ')}, humidity ${weather.humidity}%, wind ${weather.windSpeed} mph ${weather.windDirection}, UV ${weather.uvIndex}, rain chance ${weather.precipitation}%`;

  // Transport
  const transportStr = [
    `Metro: ${transport.metro.status}, ~${transport.metro.estimatedWait} min wait`,
    `Bus: ${transport.bus.status}, ~${transport.bus.estimatedWait} min wait`,
    `Rideshare: ${transport.rideshare.status}, ~${transport.rideshare.estimatedWait} min, surge ${transport.rideshare.surgeMultiplier}x`,
    `Parking: ${transport.parking.availableSpots.toLocaleString()}/${transport.parking.totalSpots.toLocaleString()} spots, shuttle ${transport.parking.shuttleWait} min`,
  ].join('\n');

  return `**Match Phase**: ${phase}
**Time**: ${state.timestamp}

### Gates
${gatesSummary}

### Busiest Zones
${zonesSummary}

### Facility Queues
${busyFacilities || 'All facilities have short queues (< 3 min)'}

### Food Vendors (Shortest Queues)
${foodSummary}

### Weather
${weatherStr}

### Transport
${transportStr}`;
}
