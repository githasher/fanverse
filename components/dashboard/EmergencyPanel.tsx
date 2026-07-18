'use client';

import React, { memo, useCallback } from 'react';
import { useFanverseStore } from '@/lib/store';
import {
  AlertTriangle,
  Phone,
  PhoneCall,
  Shield,
  Heart,
  Baby,
  X,
  Siren,
  ArrowRight,
} from 'lucide-react';
import FocusLock from 'react-focus-lock';

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
  const handleEmergencySelect = useCallback((typeId: string) => {
    const labels: Record<string, string> = {
      medical: 'EMERGENCY: Medical support needed. Please guide me to the nearest medical team or station.',
      'lost-child': 'EMERGENCY: I lost my child. Help me notify gate security and locate the child care center.',
      security: 'EMERGENCY: Suspicious activity/security hazard. How do I contact stadium security?',
      evacuation: 'EMERGENCY: Evacuation route info request. Where are my nearest gates and exit paths?'
    };
    
    const queryText = labels[typeId] || `EMERGENCY: ${typeId} support request.`;
    
    // Add user message to chat store
    useFanverseStore.getState().addMessage({
      id: `emergency-query-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: Date.now(),
      type: 'text',
    });
    
    // Switch view to chat
    useFanverseStore.getState().setActiveView('chat');
    
    // Close emergency panel
    onClose();
  }, [onClose]);

  return (
    <FocusLock>
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
                <h2 className="text-lg font-bold text-white font-outfit">Emergency SOS</h2>
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
              return (
                <button
                  key={type.id}
                  onClick={() => handleEmergencySelect(type.id)}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07] text-left transition-all hover:scale-[1.02]"
                  aria-label={`${type.label}: ${type.description}`}
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

          {/* Direct call banner */}
          <div className="px-5 pb-5">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-white">Stadium Command Post</h3>
                <p className="text-[10px] text-white/50">Direct volunteer/medical dispatch</p>
              </div>
              <button
                onClick={() => handleEmergencySelect('command-direct')}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/35 hover:bg-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusLock>
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
