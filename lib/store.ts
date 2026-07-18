// =============================================================================
// FANVERSE AI — Zustand Store
// Global state management for the FIFA Stadium Intelligence Agent
// =============================================================================

import { create } from 'zustand';
import type {
  StadiumState,
  UserProfile,
  Notification,
  ChatMessage,
  MatchDayPhase,
  TimelineEvent,
  ActiveView,
  AccessibilityMode,
} from '@/types';
import { createInitialStadiumState } from './stadiumData';

// -----------------------------------------------------------------------------
// Store interface
// -----------------------------------------------------------------------------

export interface FanverseStore {
  // ----- State slices -----
  stadiumState: StadiumState;
  userProfile: UserProfile;
  notifications: Notification[];
  chatMessages: ChatMessage[];
  currentPhase: MatchDayPhase;
  timeline: TimelineEvent[];
  activeView: ActiveView;
  isLoading: boolean;
  accessibilityMode: AccessibilityMode;

  // ----- Actions -----
  /** Append a chat message to history */
  addMessage: (message: ChatMessage) => void;

  /** Push a new proactive notification */
  addNotification: (notification: Notification) => void;

  /** Mark a notification as read */
  markNotificationRead: (notificationId: string) => void;

  /** Switch the active UI view */
  setActiveView: (view: ActiveView) => void;

  /** Replace the entire stadium state (called by simulation tick) */
  updateStadiumState: (state: StadiumState) => void;

  /** Partially update the user profile */
  updateUserProfile: (partial: Partial<UserProfile>) => void;

  /** Set the current match-day phase */
  setPhase: (phase: MatchDayPhase) => void;

  /** Replace the timeline events list */
  updateTimeline: (events: TimelineEvent[]) => void;

  /** Update accessibility rendering overrides */
  setAccessibility: (partial: Partial<AccessibilityMode>) => void;

  /** Toggle loading spinner */
  setLoading: (loading: boolean) => void;

  /** Clear all chat messages */
  clearChat: () => void;

  /** Clear all notifications */
  clearNotifications: () => void;
}

// -----------------------------------------------------------------------------
// Default values
// -----------------------------------------------------------------------------

const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  role: 'fan',
  language: 'en',
  accessibility: {
    wheelchair: false,
    visualImpairment: false,
    hearingImpairment: false,
    elderly: false,
  },
  preferences: {
    dietaryRestrictions: [],
    travelingWith: 'alone',
    favoriteTeam: '',
  },
  ticket: null,
  currentLocation: null,
  matchDayPhase: 'BEFORE_MATCH',
};

const DEFAULT_TIMELINE: TimelineEvent[] = [
  {
    time: '14:00',
    title: 'Gates Open',
    description: 'Stadium gates open for entry. Arrive early to explore the Fan Festival!',
    icon: '🚪',
    status: 'upcoming',
    phase: 'BEFORE_MATCH',
  },
  {
    time: '15:00',
    title: 'Fan Festival & Warmups',
    description: 'Enjoy live music, player warmups on the big screen, and food from 17 international vendors.',
    icon: '🎉',
    status: 'upcoming',
    phase: 'BEFORE_MATCH',
  },
  {
    time: '16:00',
    title: 'Find Your Seat',
    description: 'Head to your section. Use FANVERSE AI to find the fastest route from your gate.',
    icon: '🎟️',
    status: 'upcoming',
    phase: 'ENTERING',
  },
  {
    time: '16:30',
    title: 'National Anthems',
    description: 'Both teams\' national anthems. Please stand and show respect.',
    icon: '🏴',
    status: 'upcoming',
    phase: 'ENTERING',
  },
  {
    time: '17:00',
    title: 'Kick-Off! ⚽',
    description: 'The match begins! Enjoy the beautiful game.',
    icon: '⚽',
    status: 'upcoming',
    phase: 'INSIDE',
  },
  {
    time: '17:47',
    title: 'Half-Time',
    description: 'Great time to grab food or visit the restroom. Check queue times in the app!',
    icon: '⏸️',
    status: 'upcoming',
    phase: 'HALFTIME',
  },
  {
    time: '18:05',
    title: 'Second Half Begins',
    description: 'Back to your seat — the second half is about to start.',
    icon: '▶️',
    status: 'upcoming',
    phase: 'INSIDE',
  },
  {
    time: '18:50',
    title: 'Full Time',
    description: 'What a match! Check transport options for your journey home.',
    icon: '🏁',
    status: 'upcoming',
    phase: 'AFTER_MATCH',
  },
  {
    time: '19:00',
    title: 'Exit & Transport',
    description: 'Follow FANVERSE AI guidance for the quickest exit and transport connections.',
    icon: '🚇',
    status: 'upcoming',
    phase: 'AFTER_MATCH',
  },
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'assistant',
  content:
    'Welcome to MetLife Stadium! ⚽🏟️ I\'m **FANVERSE AI**, your personal FIFA World Cup 2026™ stadium assistant.\n\nI can help you with:\n• 🚪 Gate status & fastest entrance\n• 🍔 Food recommendations from 17 cuisines\n• 🚻 Shortest restroom queues\n• 🚇 Transport options\n• 🎟️ Ticket scanning & seat directions\n• ♿ Accessibility guidance\n\nWhat can I help you with today?',
  timestamp: Date.now(),
  type: 'text',
};

// -----------------------------------------------------------------------------
// Store creation
// -----------------------------------------------------------------------------

export const useFanverseStore = create<FanverseStore>((set) => ({
  // ----- Initial state -----
  stadiumState: createInitialStadiumState(),
  userProfile: DEFAULT_USER_PROFILE,
  notifications: [],
  chatMessages: [WELCOME_MESSAGE],
  currentPhase: 'BEFORE_MATCH',
  timeline: DEFAULT_TIMELINE,
  activeView: 'dashboard',
  isLoading: false,
  accessibilityMode: {
    highContrast: false,
    largeText: false,
    voiceNavigation: false,
  },

  // ----- Actions -----

  addMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // cap at 50
    })),

  markNotificationRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    })),

  setActiveView: (view) => set({ activeView: view }),

  updateStadiumState: (stadiumState) =>
    set({ stadiumState, currentPhase: stadiumState.phase }),

  updateUserProfile: (partial) =>
    set((state) => ({
      userProfile: { ...state.userProfile, ...partial },
    })),

  setPhase: (phase) =>
    set((state) => ({
      currentPhase: phase,
      userProfile: { ...state.userProfile, matchDayPhase: phase },
      // Update timeline statuses based on phase
      timeline: state.timeline.map((event) => {
        const phaseOrder = [
          'BEFORE_MATCH',
          'ENTERING',
          'INSIDE',
          'HALFTIME',
          'AFTER_MATCH',
        ] as MatchDayPhase[];
        const currentIdx = phaseOrder.indexOf(phase);
        const eventIdx = phaseOrder.indexOf(event.phase);

        if (eventIdx < currentIdx) return { ...event, status: 'completed' as const };
        if (eventIdx === currentIdx) return { ...event, status: 'current' as const };
        return { ...event, status: 'upcoming' as const };
      }),
    })),

  updateTimeline: (events) => set({ timeline: events }),

  setAccessibility: (partial) =>
    set((state) => ({
      accessibilityMode: { ...state.accessibilityMode, ...partial },
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  clearChat: () => set({ chatMessages: [WELCOME_MESSAGE] }),

  clearNotifications: () => set({ notifications: [] }),
}));
