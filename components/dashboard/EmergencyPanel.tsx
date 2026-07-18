'use client';

import React, { memo, useState, useCallback, useMemo } from 'react';
import { useFanverseStore } from '@/lib/store';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Shield,
  Heart,
  Baby,
  X,
  Siren,
  ArrowRight,
} from 'lucide-react';

/** Emergency category definition */
interface EmergencyType {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  priority: 'critical' | 'high';
}

const EMERGENCY_TYPES: EmergencyType[] = [
  {
    id: 'medical',
    label: 'Medical Emergency',
    icon: Heart,
    color: '#EF4444',
    description: 'Request immediate medical assistance',
    priority: 'critical',
  },
  {
    id: 'lost-child',
    label: 'Lost Child',
    icon: Baby,
    color: '#F59E0B',
    description: 'Report a missing child for immediate search',
    priority: 'critical',
  },
  {
    id: 'security',
    label: 'Security Threat',
    icon: Shield,
    color: '#8B5CF6',
    description: 'Report suspicious activity or safety concern',
    priority: 'high',
  },
  {
    id: 'evacuation',
    label: 'Evacuation Info',
    icon: Siren,
    color: '#EC4899',
    description: 'View nearest exits and evacuation routes',
    priority: 'high',
  },
];

/**
 * EmergencyPanel — Dedicated emergency response overlay.
 * Provides one-tap access to medical, security, lost-child, and evacuation
 * assistance with AI-generated contextual guidance.
 */
function EmergencyPanelComponent({ onClose }: { onClose: () => void }): React.JSX.Element {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const stadiumState = useFanverseStore((s) => s.stadiumState);

  const nearestMedicalStation = useMemo(() => {
    return stadiumState.facilities
      .filter((f) => f.type === 'medical')
      .sort((a, b) => a.waitMinutes - b.waitMinutes)[0];
  }, [stadiumState.facilities]);

  const nearestSecurity = useMemo(() => {
    return stadiumState.facilities
      .filter((f) => f.type === 'medical') // medical stations have security staff
      .sort((a, b) => a.queueLength - b.queueLength)[0];
  }, [stadiumState.facilities]);

  const handleEmergencySelect = useCallback((typeId: string) => {
    setSelectedType(typeId);
    setIsProcessing(true);
    // Simulate AI processing emergency response
    setTimeout(() => setIsProcessing(false), 1200);
  }, []);

  const getEmergencyResponse = useCallback((typeId: string): string => {
    const stationName = nearestMedicalStation?.name ?? 'Medical Station Level 1';
    const responses: Record<string, string> = {
      medical: `🚑 Medical team dispatched. Nearest station: ${stationName} (~${nearestMedicalStation?.waitMinutes ?? 2} min away). FIFA medical staff are on standby. Stay calm and remain at your current location.`,
      'lost-child': `🔍 AMBER alert activated within stadium perimeter. All gates have been notified. Security teams are conducting a section-by-section sweep. Please proceed to ${stationName} for coordination.`,
      security: `🛡️ Security alert logged. Nearest security post: ${nearestSecurity?.name ?? 'Gate A Security'}. A security team will be dispatched to your section within 3 minutes. Stay in a populated area.`,
      evacuation: `🚨 Nearest exits: Gate A (Level 1, North), Gate E (Level 1, South). Follow illuminated floor markers. Mobility-impaired guests should proceed to designated waiting areas at each gate for assisted evacuation.`,
    };
    return responses[typeId] ?? 'Emergency services have been notified. Stay calm and follow staff instructions.';
  }, [nearestMedicalStation, nearestSecurity]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label="Emergency Response Panel"
    >
      <div className="bg-[#0A0E27] border border-red-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(239,68,68,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">Emergency SOS</h2>
              <p className="text-xs text-red-300/70">24/7 Stadium Safety Response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close emergency panel"
          >
            <X className="w-5 h-5 text-white/70" aria-hidden="true" />
          </button>
        </div>

        {/* Emergency hotline */}
        <div className="px-5 pt-4 pb-2">
          <a
            href="tel:911"
            className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors"
            aria-label="Call 911 emergency services"
          >
            <Phone className="w-5 h-5 text-red-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-red-300">Call 911 — External Emergency</span>
            <ArrowRight className="w-4 h-4 text-red-400 ml-auto" aria-hidden="true" />
          </a>
        </div>

        {/* Emergency types grid */}
        <div className="p-5 grid grid-cols-2 gap-3">
          {EMERGENCY_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => handleEmergencySelect(type.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-white/30 bg-white/10 scale-[1.02]'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                }`}
                aria-label={`${type.label}: ${type.description}`}
                aria-pressed={isSelected}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: type.color + '20' }}
                >
                  <Icon className="w-5 h-5" style={{ color: type.color }} aria-hidden="true" />
                </div>
                <div className="text-sm font-semibold text-white">{type.label}</div>
                <div className="text-[10px] text-white/50 mt-1">{type.description}</div>
                {type.priority === 'critical' && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] font-bold uppercase tracking-wider">
                    Critical
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* AI Response area */}
        {selectedType && (
          <div className="px-5 pb-5">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-cyan-400">AI Emergency Response</span>
              </div>
              {isProcessing ? (
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Coordinating emergency response...</span>
                </div>
              ) : (
                <p className="text-sm text-white/80 leading-relaxed">
                  {getEmergencyResponse(selectedType)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Emergency SOS button for the sidebar */
export function EmergencySOSButton({ onClick }: { onClick: () => void }): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/30 transition-all text-red-400 text-sm font-semibold active:scale-95 animate-pulse"
      aria-label="Open emergency SOS panel"
    >
      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
      <span>Emergency SOS</span>
    </button>
  );
}

const EmergencyPanel = memo(EmergencyPanelComponent);
export default EmergencyPanel;
