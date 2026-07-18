'use client';

import React, { useState, useCallback } from 'react';
import { useFanverseStore } from '@/lib/store';
import { Camera, Upload, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import type { TicketInfo, ChatMessage } from '@/types';
import { logger } from '@/lib/logger';

/** MetLife Mock Ticket specifications for hackathon demo runs */
const MOCK_TICKET: TicketInfo = {
  matchId: 'WC2026-F1',
  section: '124',
  row: '10',
  seat: '4',
  gate: 'Gate A — East Main',
  matchName: 'Argentina vs France — FIFA Final',
  date: 'July 19, 2026',
  time: '17:00',
};

/**
 * Builds standard ChatMessage structure upon successful ticket scanning.
 *
 * @param ticket Seating details for the match.
 * @returns ChatMessage object matching types specifications.
 */
const generateSuccessMessage = (ticket: TicketInfo): ChatMessage => ({
  id: `ticket-nav-${Date.now()}`,
  role: 'assistant',
  content: `🎫 **Ticket Scanned Successfully!**\n\nI've found your seat details for the match **${ticket.matchName}**:\n• **Section:** ${ticket.section}\n• **Row:** ${ticket.row}\n• **Seat:** ${ticket.seat}\n• **Gate Recommendation:** ${ticket.gate}\n\nWould you like me to map the optimal route from your current location? (Select "Nearest restroom" or ask "where to eat" to explore options near Section ${ticket.section}).`,
  timestamp: Date.now(),
  type: 'ticket',
});

/**
 * Dashboard component for scanning user tickets.
 * Utilizes base64 OCR parsing from Gemini Vision to dynamically load user seat location.
 *
 * @returns React element representing the ticket scanner layout.
 */
export default function TicketScanner() {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const userProfile = useFanverseStore((state) => state.userProfile);
  const updateUserProfile = useFanverseStore((state) => state.updateUserProfile);
  const setActiveView = useFanverseStore((state) => state.setActiveView);
  const addMessage = useFanverseStore((state) => state.addMessage);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processImage = useCallback(async (base64: string) => {
    setLoading(true);
    setError(null);
    try {
      // Bypassing real API call for local mock ticket generation (hackathon demo check)
      if (base64 === 'data:image/jpeg;base64,mockdata') {
        await new Promise((resolve) => setTimeout(resolve, 1200)); // realistic latency
        updateUserProfile({ ticket: MOCK_TICKET });
        addMessage(generateSuccessMessage(MOCK_TICKET));
        setLoading(false);
        return;
      }

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update store user profile ticket details
      updateUserProfile({ ticket: data.ticket });

      // Automatically send a greeting message from the AI with navigation details
      addMessage(generateSuccessMessage(data.ticket));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('TicketScannerScan', err);
      setError(`Failed to extract ticket info: ${errorMsg || 'Vision limits exceeded'}. Using mock fallback.`);
      
      // Fallback ticket
      updateUserProfile({ ticket: MOCK_TICKET });
    } finally {
      setLoading(false);
    }
  }, [updateUserProfile, addMessage]);

  const handleFileProcess = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
      processImage(result);
    };
    reader.readAsDataURL(file);
  }, [processImage]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  // Mock Upload trigger for rapid testing in hackathon demos
  const triggerMockScan = useCallback(() => {
    const mockTicketBase64 = 'data:image/jpeg;base64,mockdata';
    setPreview(mockTicketBase64);
    processImage(mockTicketBase64);
  }, [processImage]);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold font-outfit text-white">Ticket-to-Seat scan</h3>
        <p className="text-xs text-white/50">Upload your PDF or image ticket to extract seat information and plan routes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col justify-center items-center h-[260px] transition-all cursor-pointer ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/5'
                : 'border-white/10 hover:border-white/20 bg-white/0'
            }`}
          >
            <input
              type="file"
              id="ticket-upload-input"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <label htmlFor="ticket-upload-input" className="cursor-pointer space-y-3 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs md:text-sm font-bold text-white block">
                  Drag & drop ticket here
                </span>
                <span className="text-[10px] text-white/40 block">
                  Supports PNG, JPG, or PDF tickets
                </span>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold border border-white/5 transition-all block">
                Browse Files
              </span>
            </label>
          </div>

          {/* Rapid Demo Trigger */}
          <button
            onClick={triggerMockScan}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-98 transition-all rounded-xl text-xs font-bold font-outfit tracking-wide flex items-center justify-center gap-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Generate Mock Ticket (Hackathon Demo)</span>
          </button>
        </div>

        {/* Status / Output Display */}
        <div className="flex flex-col justify-between p-5 bg-white/5 border border-white/5 rounded-2xl h-[330px] lg:h-auto">
          {loading ? (
            <div className="flex-1 flex flex-col justify-center items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span className="text-xs text-white/60">Analyzing ticket with Gemini OCR...</span>
            </div>
          ) : userProfile.ticket ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Ticket Verified</span>
                </div>
                
                <div className="p-4 bg-[#0A0E27] rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-start border-b border-white/5 pb-2">
                    <span className="font-extrabold text-sm md:text-base text-cyan-400 font-outfit truncate max-w-[70%]">
                      {userProfile.ticket.matchName}
                    </span>
                    <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-1.5 py-0.5 rounded font-mono">
                      {userProfile.ticket.matchId}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <span className="text-[9px] text-white/40 uppercase block">Section</span>
                      <span className="font-bold text-white mt-0.5 block">{userProfile.ticket.section}</span>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <span className="text-[9px] text-white/40 uppercase block">Row</span>
                      <span className="font-bold text-white mt-0.5 block">{userProfile.ticket.row}</span>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <span className="text-[9px] text-white/40 uppercase block">Seat</span>
                      <span className="font-bold text-white mt-0.5 block">{userProfile.ticket.seat}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs pt-1">
                    <div>
                      <span className="text-[9px] text-white/40 uppercase block">Date & Time</span>
                      <span className="text-white/80">{userProfile.ticket.date} @ {userProfile.ticket.time}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-white/40 uppercase block">Entrance Gate</span>
                      <span className="text-emerald-400 font-bold">{userProfile.ticket.gate.split(' — ')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveView('map')}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-[#0A0E27] font-bold text-xs rounded-xl active:scale-95 transition-all text-center"
                >
                  Navigate to Seat
                </button>
                <button
                  onClick={() => setActiveView('chat')}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs rounded-xl active:scale-95 transition-all text-center"
                >
                  Consult AI Agent
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center gap-2">
              {preview ? (
                <div className="relative w-20 h-28 border border-white/10 rounded-lg overflow-hidden bg-black/25 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Ticket preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <FileText className="w-10 h-10 text-white/20" />
              )}
              <span className="text-xs font-bold text-white/60">No ticket uploaded yet</span>
              <p className="text-[10px] text-white/40 max-w-[200px]">
                Upload your ticket to display details and get seats routing.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
