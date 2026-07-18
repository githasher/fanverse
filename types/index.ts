// =============================================================================
// FANVERSE AI — Type Definitions
// Comprehensive types for the FIFA Stadium Intelligence Agent
// =============================================================================

// -----------------------------------------------------------------------------
// Enums & Literal Types
// -----------------------------------------------------------------------------

/** Match-day phases that drive the entire UX and simulation */
export type MatchDayPhase =
  | 'BEFORE_MATCH'
  | 'ENTERING'
  | 'INSIDE'
  | 'HALFTIME'
  | 'AFTER_MATCH';

/** Notification categories the system can emit */
export type NotificationType =
  | 'crowd'
  | 'queue'
  | 'weather'
  | 'gate'
  | 'timing'
  | 'transport'
  | 'emergency';

/** Priority levels for notifications */
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

/** Chat message roles */
export type ChatRole = 'user' | 'assistant' | 'system';

/** Chat message content type */
export type ChatMessageType = 'text' | 'notification' | 'route' | 'ticket';

/** Timeline event status */
export type TimelineStatus = 'completed' | 'current' | 'upcoming';

/** Facility categories */
export type FacilityType =
  | 'restroom'
  | 'food'
  | 'merchandise'
  | 'medical'
  | 'baby_care'
  | 'atm'
  | 'information'
  | 'water_station';

/** Gate operational status */
export type GateStatus = 'open' | 'closed' | 'restricted';

/** Dietary tags for food vendors */
export type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'halal'
  | 'kosher'
  | 'nut-free'
  | 'dairy-free';

/** Cuisine types for the World Cup food variety */
export type CuisineType =
  | 'American'
  | 'Mexican'
  | 'Argentine'
  | 'Japanese'
  | 'Middle Eastern'
  | 'Italian'
  | 'Brazilian'
  | 'Korean'
  | 'Indian'
  | 'German'
  | 'British'
  | 'French'
  | 'Spanish'
  | 'Caribbean'
  | 'African';

/** Active view in the app shell */
export type ActiveView =
  | 'dashboard'
  | 'chat'
  | 'map'
  | 'timeline'
  | 'scanner'
  | 'settings';

// -----------------------------------------------------------------------------
// Coordinate helpers
// -----------------------------------------------------------------------------

/** Geographic coordinate */
export interface GeoCoordinate {
  lat: number;
  lng: number;
}

/** 2-D position on the stadium floor-plan (0-100 normalised) */
export interface MapPosition {
  x: number;
  y: number;
}

// -----------------------------------------------------------------------------
// Accessibility & User Preferences
// -----------------------------------------------------------------------------

/** Accessibility needs of a fan */
export interface AccessibilityPreferences {
  wheelchair: boolean;
  visualImpairment: boolean;
  hearingImpairment: boolean;
  elderly: boolean;
}

/** General fan preferences */
export interface UserPreferences {
  dietaryRestrictions: DietaryTag[];
  travelingWith: 'alone' | 'partner' | 'family' | 'group';
  favoriteTeam: string;
}

/** Info extracted from a scanned ticket */
export interface TicketInfo {
  matchId: string;
  section: string;
  row: string;
  seat: string;
  gate: string;
  matchName: string;
  date: string;
  time: string;
}

/** Complete user profile */
export interface UserProfile {
  name: string;
  role: 'fan' | 'staff';
  language: string;
  accessibility: AccessibilityPreferences;
  preferences: UserPreferences;
  ticket: TicketInfo | null;
  currentLocation: GeoCoordinate | null;
  matchDayPhase: MatchDayPhase;
}

// -----------------------------------------------------------------------------
// Accessibility Mode (UI rendering overrides)
// -----------------------------------------------------------------------------

export interface AccessibilityMode {
  highContrast: boolean;
  largeText: boolean;
  voiceNavigation: boolean;
}

// -----------------------------------------------------------------------------
// Stadium — Gates
// -----------------------------------------------------------------------------

export interface Gate {
  id: string;
  name: string;
  position: MapPosition;
  geoPosition: GeoCoordinate;
  status: GateStatus;
  crowdLevel: number; // 0-1 normalised
  waitMinutes: number;
  /** Sections this gate serves */
  servingSections: string[];
  accessibleEntry: boolean;
}

// -----------------------------------------------------------------------------
// Stadium — Zones
// -----------------------------------------------------------------------------

export interface Zone {
  id: string;
  name: string;
  section: string;
  position: MapPosition;
  crowdDensity: number; // 0-1
  temperature: number; // °F
  /** Whether the zone is covered / has shade */
  covered: boolean;
}

// -----------------------------------------------------------------------------
// Stadium — Facilities
// -----------------------------------------------------------------------------

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  position: MapPosition;
  zone: string;
  queueLength: number; // number of people
  waitMinutes: number;
  accessible: boolean;
  open: boolean;
}

// -----------------------------------------------------------------------------
// Stadium — Food Vendors
// -----------------------------------------------------------------------------

export interface FoodVendor {
  id: string;
  name: string;
  cuisine: CuisineType;
  menuHighlights: string[];
  priceRange: { min: number; max: number };
  dietaryTags: DietaryTag[];
  position: MapPosition;
  zone: string;
  queueLength: number;
  waitMinutes: number;
  open: boolean;
}

// -----------------------------------------------------------------------------
// Stadium — Weather
// -----------------------------------------------------------------------------

export interface Weather {
  temperature: number; // °F
  feelsLike: number;
  condition: 'sunny' | 'cloudy' | 'partly_cloudy' | 'rain' | 'thunderstorm' | 'clear';
  humidity: number; // 0-100%
  windSpeed: number; // mph
  windDirection: string;
  uvIndex: number;
  precipitation: number; // 0-100 probability %
  /** Unix timestamp of last update */
  updatedAt: number;
}

// -----------------------------------------------------------------------------
// Stadium — Transport
// -----------------------------------------------------------------------------

export interface TransportMode {
  available: boolean;
  estimatedWait: number; // minutes
  surgeMultiplier?: number; // for rideshare
  nearestStop?: string;
  status: 'normal' | 'delayed' | 'suspended';
  notes: string;
}

export interface Transport {
  metro: TransportMode;
  bus: TransportMode;
  rideshare: TransportMode;
  parking: {
    availableSpots: number;
    totalSpots: number;
    nearestLot: string;
    shuttleWait: number; // minutes
  };
}

// -----------------------------------------------------------------------------
// Stadium State — top-level aggregate
// -----------------------------------------------------------------------------

export interface StadiumState {
  /** Current match-day phase */
  phase: MatchDayPhase;
  /** Simulation tick counter */
  tick: number;
  /** ISO timestamp of state snapshot */
  timestamp: string;
  gates: Gate[];
  zones: Zone[];
  facilities: Facility[];
  foodVendors: FoodVendor[];
  weather: Weather;
  transport: Transport;
}

// -----------------------------------------------------------------------------
// Notifications
// -----------------------------------------------------------------------------

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

// -----------------------------------------------------------------------------
// Chat
// -----------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  type: ChatMessageType;
}

// -----------------------------------------------------------------------------
// Timeline
// -----------------------------------------------------------------------------

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  icon: string;
  status: TimelineStatus;
  phase: MatchDayPhase;
}
