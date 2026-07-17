'use client';

import React, { useEffect } from 'react';
import { useFanverseStore } from '@/lib/store';
import { useSimulation } from '@/hooks/useSimulation';
import Sidebar from '@/components/dashboard/Sidebar';
import StadiumOverview from '@/components/dashboard/StadiumOverview';
import StadiumMap from '@/components/dashboard/StadiumMap';
import ChatInterface from '@/components/dashboard/ChatInterface';
import FanTimeline from '@/components/dashboard/FanTimeline';
import TicketScanner from '@/components/dashboard/TicketScanner';
import Settings from '@/components/dashboard/Settings';
import ProactiveAlert from '@/components/dashboard/ProactiveAlert';

export default function DashboardPage() {
  // Drive the live stadium simulation
  const { isRunning } = useSimulation();
  
  const activeView = useFanverseStore((state) => state.activeView);
  const userProfile = useFanverseStore((state) => state.userProfile);
  const notifications = useFanverseStore((state) => state.notifications);
  const clearNotifications = useFanverseStore((state) => state.clearNotifications);

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
          console.warn('Geolocation not available:', error.message);
          // Set standard mock location near MetLife Stadium
          useFanverseStore.getState().updateUserProfile({
            currentLocation: { lat: 40.8128, lng: -74.0742 },
          });
        }
      );
    }
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <StadiumOverview />;
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
        return <StadiumOverview />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0E27] text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative p-4 md:p-8">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-outfit tracking-tight capitalize text-white">
              {activeView === 'dashboard' ? 'Stadium digital twin' : activeView}
            </h1>
            <p className="text-xs md:text-sm text-white/50">
              {isRunning ? '🟢 Connected to Live Stadium Data' : '🔴 Simulation Paused'}
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
    </div>
  );
}
