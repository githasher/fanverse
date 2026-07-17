// =============================================================================
// FANVERSE AI — MetLife Stadium Data
// Realistic data for MetLife Stadium, FIFA 2026 World Cup venue
// =============================================================================

import type {
  Gate,
  Zone,
  Facility,
  FoodVendor,
  Weather,
  Transport,
  StadiumState,
  GeoCoordinate,
} from '@/types';

// -----------------------------------------------------------------------------
// Stadium Metadata
// -----------------------------------------------------------------------------

export const STADIUM_INFO = {
  name: 'MetLife Stadium',
  fullName: 'MetLife Stadium — FIFA World Cup 2026™ Venue',
  location: {
    address: 'One MetLife Stadium Drive, East Rutherford, NJ 07073',
    geo: { lat: 40.8128, lng: -74.0742 } as GeoCoordinate,
  },
  capacity: 82_500,
  yearOpened: 2010,
  surfaceType: 'Natural grass (re-laid for FIFA 2026)',
  roofType: 'Open-air',
  levels: ['100 Level', '200 Level (Mezzanine)', '300 Level (Upper)'],
  fifaDesignation: 'New York / New Jersey — Venue 1',
  hostMatches: [
    'Group Stage (6 matches)',
    'Round of 32',
    'Quarter-Final',
    'Semi-Final',
    'FIFA World Cup 2026™ Final',
  ],
} as const;

// -----------------------------------------------------------------------------
// Gates (8 entrances around the stadium)
// -----------------------------------------------------------------------------

export const INITIAL_GATES: Gate[] = [
  {
    id: 'gate-a',
    name: 'Gate A — East Main',
    position: { x: 80, y: 50 },
    geoPosition: { lat: 40.8135, lng: -74.0725 },
    status: 'open',
    crowdLevel: 0.3,
    waitMinutes: 5,
    servingSections: ['A', 'B', 'L'],
    accessibleEntry: true,
  },
  {
    id: 'gate-b',
    name: 'Gate B — Northeast',
    position: { x: 70, y: 20 },
    geoPosition: { lat: 40.8142, lng: -74.0730 },
    status: 'open',
    crowdLevel: 0.25,
    waitMinutes: 4,
    servingSections: ['B', 'C'],
    accessibleEntry: false,
  },
  {
    id: 'gate-c',
    name: 'Gate C — North',
    position: { x: 50, y: 10 },
    geoPosition: { lat: 40.8148, lng: -74.0742 },
    status: 'open',
    crowdLevel: 0.2,
    waitMinutes: 3,
    servingSections: ['C', 'D'],
    accessibleEntry: true,
  },
  {
    id: 'gate-d',
    name: 'Gate D — Northwest',
    position: { x: 30, y: 20 },
    geoPosition: { lat: 40.8142, lng: -74.0755 },
    status: 'open',
    crowdLevel: 0.35,
    waitMinutes: 6,
    servingSections: ['D', 'E'],
    accessibleEntry: false,
  },
  {
    id: 'gate-e',
    name: 'Gate E — West Main',
    position: { x: 20, y: 50 },
    geoPosition: { lat: 40.8128, lng: -74.0760 },
    status: 'open',
    crowdLevel: 0.4,
    waitMinutes: 7,
    servingSections: ['E', 'F', 'G'],
    accessibleEntry: true,
  },
  {
    id: 'gate-f',
    name: 'Gate F — Southwest',
    position: { x: 30, y: 80 },
    geoPosition: { lat: 40.8115, lng: -74.0755 },
    status: 'open',
    crowdLevel: 0.2,
    waitMinutes: 3,
    servingSections: ['G', 'H'],
    accessibleEntry: false,
  },
  {
    id: 'gate-g',
    name: 'Gate G — South',
    position: { x: 50, y: 90 },
    geoPosition: { lat: 40.8110, lng: -74.0742 },
    status: 'open',
    crowdLevel: 0.15,
    waitMinutes: 2,
    servingSections: ['H', 'I', 'J'],
    accessibleEntry: true,
  },
  {
    id: 'gate-h',
    name: 'Gate H — Southeast',
    position: { x: 70, y: 80 },
    geoPosition: { lat: 40.8115, lng: -74.0730 },
    status: 'open',
    crowdLevel: 0.28,
    waitMinutes: 4,
    servingSections: ['J', 'K', 'L'],
    accessibleEntry: false,
  },
];

// -----------------------------------------------------------------------------
// Zones (12 sections around the stadium bowl)
// -----------------------------------------------------------------------------

export const INITIAL_ZONES: Zone[] = [
  { id: 'zone-a', name: 'Section A — East Lower', section: 'A', position: { x: 78, y: 45 }, crowdDensity: 0.4, temperature: 78, covered: false },
  { id: 'zone-b', name: 'Section B — East Upper', section: 'B', position: { x: 75, y: 35 }, crowdDensity: 0.35, temperature: 79, covered: false },
  { id: 'zone-c', name: 'Section C — North-East', section: 'C', position: { x: 62, y: 20 }, crowdDensity: 0.3, temperature: 77, covered: false },
  { id: 'zone-d', name: 'Section D — North', section: 'D', position: { x: 42, y: 15 }, crowdDensity: 0.25, temperature: 76, covered: true },
  { id: 'zone-e', name: 'Section E — North-West', section: 'E', position: { x: 28, y: 25 }, crowdDensity: 0.3, temperature: 77, covered: false },
  { id: 'zone-f', name: 'Section F — West Lower', section: 'F', position: { x: 22, y: 42 }, crowdDensity: 0.45, temperature: 80, covered: false },
  { id: 'zone-g', name: 'Section G — West Upper', section: 'G', position: { x: 22, y: 58 }, crowdDensity: 0.42, temperature: 80, covered: false },
  { id: 'zone-h', name: 'Section H — South-West', section: 'H', position: { x: 28, y: 72 }, crowdDensity: 0.28, temperature: 78, covered: false },
  { id: 'zone-i', name: 'Section I — South', section: 'I', position: { x: 42, y: 82 }, crowdDensity: 0.2, temperature: 75, covered: true },
  { id: 'zone-j', name: 'Section J — South-East', section: 'J', position: { x: 60, y: 78 }, crowdDensity: 0.22, temperature: 76, covered: false },
  { id: 'zone-k', name: 'Section K — East Mezzanine', section: 'K', position: { x: 78, y: 60 }, crowdDensity: 0.38, temperature: 79, covered: false },
  { id: 'zone-l', name: 'Section L — VIP East', section: 'L', position: { x: 82, y: 50 }, crowdDensity: 0.15, temperature: 72, covered: true },
];

// -----------------------------------------------------------------------------
// Facilities (24 across the stadium)
// -----------------------------------------------------------------------------

export const INITIAL_FACILITIES: Facility[] = [
  // Restrooms (6)
  { id: 'rest-1', name: 'Restroom 100 Level East', type: 'restroom', position: { x: 76, y: 40 }, zone: 'A', queueLength: 12, waitMinutes: 4, accessible: true, open: true },
  { id: 'rest-2', name: 'Restroom 100 Level North', type: 'restroom', position: { x: 50, y: 15 }, zone: 'D', queueLength: 8, waitMinutes: 3, accessible: true, open: true },
  { id: 'rest-3', name: 'Restroom 100 Level West', type: 'restroom', position: { x: 24, y: 50 }, zone: 'F', queueLength: 15, waitMinutes: 5, accessible: true, open: true },
  { id: 'rest-4', name: 'Restroom 200 Level NE', type: 'restroom', position: { x: 65, y: 25 }, zone: 'C', queueLength: 6, waitMinutes: 2, accessible: false, open: true },
  { id: 'rest-5', name: 'Restroom 200 Level SW', type: 'restroom', position: { x: 35, y: 75 }, zone: 'H', queueLength: 5, waitMinutes: 2, accessible: false, open: true },
  { id: 'rest-6', name: 'Restroom 300 Level South', type: 'restroom', position: { x: 50, y: 85 }, zone: 'I', queueLength: 10, waitMinutes: 4, accessible: true, open: true },

  // Food Courts (6 — separate from named vendors below)
  { id: 'food-court-1', name: 'East Concourse Food Court', type: 'food', position: { x: 82, y: 48 }, zone: 'A', queueLength: 20, waitMinutes: 8, accessible: true, open: true },
  { id: 'food-court-2', name: 'North Concourse Food Court', type: 'food', position: { x: 48, y: 12 }, zone: 'D', queueLength: 14, waitMinutes: 6, accessible: true, open: true },
  { id: 'food-court-3', name: 'West Concourse Food Court', type: 'food', position: { x: 18, y: 48 }, zone: 'F', queueLength: 25, waitMinutes: 10, accessible: true, open: true },
  { id: 'food-court-4', name: 'South Concourse Food Court', type: 'food', position: { x: 48, y: 88 }, zone: 'I', queueLength: 12, waitMinutes: 5, accessible: true, open: true },
  { id: 'food-court-5', name: 'Mezzanine Food Hall', type: 'food', position: { x: 60, y: 35 }, zone: 'B', queueLength: 18, waitMinutes: 7, accessible: false, open: true },
  { id: 'food-court-6', name: 'VIP Lounge Dining', type: 'food', position: { x: 85, y: 52 }, zone: 'L', queueLength: 3, waitMinutes: 2, accessible: true, open: true },

  // Merchandise (4)
  { id: 'merch-1', name: 'FIFA Official Store — East', type: 'merchandise', position: { x: 80, y: 55 }, zone: 'A', queueLength: 30, waitMinutes: 12, accessible: true, open: true },
  { id: 'merch-2', name: 'FIFA Official Store — West', type: 'merchandise', position: { x: 20, y: 55 }, zone: 'G', queueLength: 22, waitMinutes: 9, accessible: true, open: true },
  { id: 'merch-3', name: 'Team Kit Shop — North', type: 'merchandise', position: { x: 55, y: 18 }, zone: 'C', queueLength: 15, waitMinutes: 6, accessible: false, open: true },
  { id: 'merch-4', name: 'Souvenir Kiosk — South', type: 'merchandise', position: { x: 45, y: 85 }, zone: 'I', queueLength: 10, waitMinutes: 4, accessible: false, open: true },

  // Medical (3)
  { id: 'med-1', name: 'First Aid — East Gate', type: 'medical', position: { x: 83, y: 50 }, zone: 'A', queueLength: 0, waitMinutes: 0, accessible: true, open: true },
  { id: 'med-2', name: 'First Aid — West Gate', type: 'medical', position: { x: 17, y: 50 }, zone: 'F', queueLength: 0, waitMinutes: 0, accessible: true, open: true },
  { id: 'med-3', name: 'Medical Center — South', type: 'medical', position: { x: 50, y: 92 }, zone: 'I', queueLength: 0, waitMinutes: 0, accessible: true, open: true },

  // Baby Care (2)
  { id: 'baby-1', name: 'Family Room — East', type: 'baby_care', position: { x: 78, y: 42 }, zone: 'A', queueLength: 2, waitMinutes: 3, accessible: true, open: true },
  { id: 'baby-2', name: 'Family Room — West', type: 'baby_care', position: { x: 22, y: 58 }, zone: 'G', queueLength: 1, waitMinutes: 2, accessible: true, open: true },

  // Water Stations (2)
  { id: 'water-1', name: 'Hydration Station — North', type: 'water_station', position: { x: 50, y: 18 }, zone: 'D', queueLength: 5, waitMinutes: 2, accessible: true, open: true },
  { id: 'water-2', name: 'Hydration Station — South', type: 'water_station', position: { x: 50, y: 82 }, zone: 'I', queueLength: 4, waitMinutes: 1, accessible: true, open: true },

  // Information (1)
  { id: 'info-1', name: 'Fan Information Desk', type: 'information', position: { x: 50, y: 50 }, zone: 'A', queueLength: 3, waitMinutes: 5, accessible: true, open: true },
];

// -----------------------------------------------------------------------------
// Food Vendors (17 — international World Cup variety)
// -----------------------------------------------------------------------------

export const INITIAL_FOOD_VENDORS: FoodVendor[] = [
  {
    id: 'vendor-1', name: 'Liberty Burger Co.', cuisine: 'American',
    menuHighlights: ['Smash Burger', 'Loaded Fries', 'Milkshake'],
    priceRange: { min: 10, max: 18 }, dietaryTags: ['gluten-free'],
    position: { x: 81, y: 46 }, zone: 'A', queueLength: 18, waitMinutes: 8, open: true,
  },
  {
    id: 'vendor-2', name: 'Taquería Olé', cuisine: 'Mexican',
    menuHighlights: ['Birria Tacos', 'Elote Cup', 'Horchata'],
    priceRange: { min: 8, max: 16 }, dietaryTags: ['gluten-free'],
    position: { x: 30, y: 22 }, zone: 'E', queueLength: 22, waitMinutes: 10, open: true,
  },
  {
    id: 'vendor-3', name: 'Parrilla Buenos Aires', cuisine: 'Argentine',
    menuHighlights: ['Choripán', 'Empanadas', 'Dulce de Leche Churros'],
    priceRange: { min: 9, max: 20 }, dietaryTags: [],
    position: { x: 62, y: 78 }, zone: 'J', queueLength: 14, waitMinutes: 7, open: true,
  },
  {
    id: 'vendor-4', name: 'Tokyo Bento Box', cuisine: 'Japanese',
    menuHighlights: ['Katsu Curry', 'Takoyaki', 'Matcha Soft Serve'],
    priceRange: { min: 12, max: 22 }, dietaryTags: ['dairy-free'],
    position: { x: 65, y: 23 }, zone: 'C', queueLength: 16, waitMinutes: 9, open: true,
  },
  {
    id: 'vendor-5', name: 'Habibi Shawarma', cuisine: 'Middle Eastern',
    menuHighlights: ['Chicken Shawarma Wrap', 'Falafel Plate', 'Baklava'],
    priceRange: { min: 10, max: 18 }, dietaryTags: ['halal', 'vegetarian'],
    position: { x: 20, y: 45 }, zone: 'F', queueLength: 20, waitMinutes: 9, open: true,
  },
  {
    id: 'vendor-6', name: 'Napoli Slice', cuisine: 'Italian',
    menuHighlights: ['Margherita Slice', 'Pepperoni Slice', 'Cannoli'],
    priceRange: { min: 7, max: 14 }, dietaryTags: ['vegetarian'],
    position: { x: 48, y: 13 }, zone: 'D', queueLength: 25, waitMinutes: 11, open: true,
  },
  {
    id: 'vendor-7', name: 'Churrascaria Gol!', cuisine: 'Brazilian',
    menuHighlights: ['Picanha Skewer', 'Pão de Queijo', 'Açaí Bowl'],
    priceRange: { min: 11, max: 24 }, dietaryTags: ['gluten-free'],
    position: { x: 35, y: 78 }, zone: 'H', queueLength: 12, waitMinutes: 6, open: true,
  },
  {
    id: 'vendor-8', name: 'Seoul Street', cuisine: 'Korean',
    menuHighlights: ['Korean Fried Chicken', 'Bulgogi Rice Bowl', 'Tteokbokki'],
    priceRange: { min: 11, max: 20 }, dietaryTags: ['dairy-free'],
    position: { x: 22, y: 62 }, zone: 'G', queueLength: 15, waitMinutes: 7, open: true,
  },
  {
    id: 'vendor-9', name: 'Bombay Bites', cuisine: 'Indian',
    menuHighlights: ['Butter Chicken Wrap', 'Samosa Chaat', 'Mango Lassi'],
    priceRange: { min: 9, max: 17 }, dietaryTags: ['vegetarian', 'vegan', 'halal'],
    position: { x: 78, y: 62 }, zone: 'K', queueLength: 10, waitMinutes: 5, open: true,
  },
  {
    id: 'vendor-10', name: 'Biergarten Bayern', cuisine: 'German',
    menuHighlights: ['Bratwurst', 'Pretzel', 'Apfelstrudel'],
    priceRange: { min: 8, max: 16 }, dietaryTags: [],
    position: { x: 40, y: 18 }, zone: 'D', queueLength: 18, waitMinutes: 8, open: true,
  },
  {
    id: 'vendor-11', name: 'The Chippy', cuisine: 'British',
    menuHighlights: ['Fish & Chips', 'Meat Pie', 'Sticky Toffee Pudding'],
    priceRange: { min: 10, max: 18 }, dietaryTags: [],
    position: { x: 72, y: 35 }, zone: 'B', queueLength: 13, waitMinutes: 6, open: true,
  },
  {
    id: 'vendor-12', name: 'Le Crêperie', cuisine: 'French',
    menuHighlights: ['Nutella Crêpe', 'Ham & Gruyère Crêpe', 'Crème Brûlée'],
    priceRange: { min: 8, max: 15 }, dietaryTags: ['vegetarian'],
    position: { x: 84, y: 54 }, zone: 'L', queueLength: 5, waitMinutes: 3, open: true,
  },
  {
    id: 'vendor-13', name: 'Tapas Barça', cuisine: 'Spanish',
    menuHighlights: ['Patatas Bravas', 'Jamón Ibérico', 'Sangria (N/A)'],
    priceRange: { min: 9, max: 19 }, dietaryTags: ['gluten-free'],
    position: { x: 38, y: 82 }, zone: 'I', queueLength: 8, waitMinutes: 4, open: true,
  },
  {
    id: 'vendor-14', name: 'Island Jerk Shack', cuisine: 'Caribbean',
    menuHighlights: ['Jerk Chicken Plate', 'Plantain Chips', 'Rum Punch (N/A)'],
    priceRange: { min: 10, max: 18 }, dietaryTags: ['gluten-free', 'dairy-free'],
    position: { x: 55, y: 85 }, zone: 'I', queueLength: 11, waitMinutes: 5, open: true,
  },
  {
    id: 'vendor-15', name: 'Mama Africa Kitchen', cuisine: 'African',
    menuHighlights: ['Jollof Rice Bowl', 'Suya Skewer', 'Puff Puff'],
    priceRange: { min: 9, max: 17 }, dietaryTags: ['halal', 'dairy-free'],
    position: { x: 28, y: 68 }, zone: 'H', queueLength: 9, waitMinutes: 4, open: true,
  },
  {
    id: 'vendor-16', name: 'Green Goal', cuisine: 'American',
    menuHighlights: ['Impossible Burger', 'Kale Caesar Wrap', 'Smoothie Bowl'],
    priceRange: { min: 11, max: 19 }, dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
    position: { x: 50, y: 20 }, zone: 'D', queueLength: 7, waitMinutes: 3, open: true,
  },
  {
    id: 'vendor-17', name: 'NYC Deli Classic', cuisine: 'American',
    menuHighlights: ['Pastrami on Rye', 'NY Cheesecake', 'Egg Cream'],
    priceRange: { min: 10, max: 20 }, dietaryTags: ['kosher'],
    position: { x: 75, y: 55 }, zone: 'K', queueLength: 14, waitMinutes: 6, open: true,
  },
];

// -----------------------------------------------------------------------------
// Default Weather (summer evening in East Rutherford, NJ)
// -----------------------------------------------------------------------------

export const INITIAL_WEATHER: Weather = {
  temperature: 78,
  feelsLike: 82,
  condition: 'partly_cloudy',
  humidity: 62,
  windSpeed: 8,
  windDirection: 'SW',
  uvIndex: 4,
  precipitation: 15,
  updatedAt: Date.now(),
};

// -----------------------------------------------------------------------------
// Default Transport
// -----------------------------------------------------------------------------

export const INITIAL_TRANSPORT: Transport = {
  metro: {
    available: true,
    estimatedWait: 6,
    nearestStop: 'Meadowlands Rail Station',
    status: 'normal',
    notes: 'NJ Transit special event service — trains every 8 min',
  },
  bus: {
    available: true,
    estimatedWait: 10,
    nearestStop: 'MetLife Bus Terminal',
    status: 'normal',
    notes: 'Route 160 & 165 running extended service',
  },
  rideshare: {
    available: true,
    estimatedWait: 12,
    surgeMultiplier: 1.5,
    status: 'normal',
    notes: 'Designated pickup at Lot K',
  },
  parking: {
    availableSpots: 8200,
    totalSpots: 28_000,
    nearestLot: 'Lot E — East Gate',
    shuttleWait: 5,
  },
};

// -----------------------------------------------------------------------------
// Build initial StadiumState snapshot
// -----------------------------------------------------------------------------

export function createInitialStadiumState(): StadiumState {
  return {
    phase: 'BEFORE_MATCH',
    tick: 0,
    timestamp: new Date().toISOString(),
    gates: structuredClone(INITIAL_GATES),
    zones: structuredClone(INITIAL_ZONES),
    facilities: structuredClone(INITIAL_FACILITIES),
    foodVendors: structuredClone(INITIAL_FOOD_VENDORS),
    weather: { ...INITIAL_WEATHER, updatedAt: Date.now() },
    transport: structuredClone(INITIAL_TRANSPORT),
  };
}
