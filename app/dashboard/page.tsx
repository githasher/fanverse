'use client';

import { useEffect, type ReactNode } from 'react';
import { useFanverseStore } from '@/lib/store';
import { useSimulation } from '@/hooks/useSimulation';
import Sidebar from '@/components/dashboard/Sidebar';
import dynamic from 'next/dynamic';
import ProactiveAlert from '@/components/dashboard/ProactiveAlert';

const StadiumOverview = dynamic(() => import('@/components/dashboard/StadiumOverview'), { ssr: false });
const StadiumMap = dynamic(() => import('@/components/dashboard/StadiumMap'), { ssr: false });
const ChatInterface = dynamic(() => import('@/components/dashboard/ChatInterface'), { ssr: false });
const FanTimeline = dynamic(() => import('@/components/dashboard/FanTimeline'), { ssr: false });
const TicketScanner = dynamic(() => import('@/components/dashboard/TicketScanner'), { ssr: false });
const Settings = dynamic(() => import('@/components/dashboard/Settings'), { ssr: false });
const StaffCommand = dynamic(() => import('@/components/dashboard/StaffCommand'), { ssr: false });
import ErrorBoundary from '@/components/ErrorBoundary';
import { t } from '@/lib/i18n';
import EmergencyPanel from '@/components/dashboard/EmergencyPanel';
import { logger } from '@/lib/logger';

/**
 * Main dashboard container page component.
 * Orchestrates live simulation syncing, layout shell rendering (with responsive Sidebar),
 * view routers, and proactive notification stack alerts.
 *
 * @returns ReactNode representing the dashboard page element.
 */
export default function DashboardPage(): ReactNode {
  // Drive the live stadium simulation
  const { isRunning } = useSimulation();
  
  const activeView = useFanverseStore((state) => state.activeView);
  const userProfile = useFanverseStore((state) => state.userProfile);
  const showEmergency = useFanverseStore((state) => state.showEmergency);
  const setShowEmergency = useFanverseStore((state) => state.setShowEmergency);

  // Set user location if browser geolocation is available
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          useFanverseStore.getState().updateUserProfile({
            currentLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        },
        (error) => {
          logger.warn('DashboardPageGeolocation', `Geolocation not available: ${error.message}`);
          // Set standard mock location near MetLife Stadium
          useFanverseStore.getState().updateUserProfile({
            currentLocation: { lat: 40.8128, lng: -74.0742 },
          });
        }
      );
    }
  }, []);

  /**
   * Evaluates the active selected view from the Zustand store and renders the matching component.
   * Renders the organizer co-pilot or public overview depending on user profile roles.
   *
   * @returns ReactNode child view to be mounted.
   */
  const renderActiveView = (): ReactNode => {
    switch (activeView) {
      case 'dashboard':
        return userProfile.role === 'staff' ? <StaffCommand /> : <StadiumOverview />;
      case 'map':
        return <StadiumMap />;
      case 'chat':
        return <ChatInterface />;
      case 'timeline':
        return <FanTimeline />;
      case 'scanner':
        return <TicketScanner />;
      case 'settings':
        return <Settings />;
      default:
        return userProfile.role === 'staff' ? <StaffCommand /> : <StadiumOverview />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden bg-[#0A0E27] text-white">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-y-auto relative p-4 md:p-8">
          {/* Header bar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-outfit tracking-tight capitalize text-white font-outfit">
                {activeView === 'dashboard'
                  ? (userProfile.role === 'staff'
                      ? t('operationsTitle', userProfile.language)
                      : t('dashboardTitle', userProfile.language))
                  : (activeView === 'settings'
                      ? t('settingsTitle', userProfile.language)
                      : activeView === 'map'
                      ? t('dashboardTitle', userProfile.language)
                      : activeView)}
              </h1>
              <p className="text-xs md:text-sm text-white/50">
                {isRunning
                  ? `🟢 ${t('connectedSensors', userProfile.language)}`
                  : `🔴 ${t('simulationPaused', userProfile.language)}`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* User tag */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-white/90">
                  {userProfile.name || 'Anonymous Fan'}
                </span>
                <span className="text-xs text-cyan-400">
                  {userProfile.ticket?.section ? `Sec ${userProfile.ticket.section}, Seat ${userProfile.ticket.seat}` : 'General Entry'}
                </span>
              </div>
              
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-amber-400 flex items-center justify-center font-bold text-[#0A0E27] font-outfit shadow-lg shadow-cyan-500/20 text-sm md:text-base">
                {(userProfile.name || 'F').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* View container */}
          <div className="flex-1 relative">
            {renderActiveView()}
          </div>
        </main>

        {/* Stack of proactive alerts (Notification Toasts) */}
        <ProactiveAlert />

        {/* Emergency SOS Overlay */}
        {showEmergency && <EmergencyPanel onClose={() => setShowEmergency(false)} />}
      </div>
    </ErrorBoundary>
  );
}
