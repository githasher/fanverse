'use client';

import React from 'react';
import { useFanverseStore } from '@/lib/store';
import { Shield, Eye, Flame, Smile } from 'lucide-react';
import type { DietaryTag } from '@/types';

export default function Settings() {
  const userProfile = useFanverseStore((state) => state.userProfile);
  const accessibilityMode = useFanverseStore((state) => state.accessibilityMode);
  const updateUserProfile = useFanverseStore((state) => state.updateUserProfile);
  const setAccessibility = useFanverseStore((state) => state.setAccessibility);

  const handleAccessibilityToggle = (key: 'wheelchair' | 'visualImpairment' | 'hearingImpairment' | 'elderly') => {
    updateUserProfile({
      accessibility: {
        ...userProfile.accessibility,
        [key]: !userProfile.accessibility[key],
      },
    });
  };

  const handleDisplayToggle = (key: 'highContrast' | 'largeText' | 'voiceNavigation') => {
    setAccessibility({
      [key]: !accessibilityMode[key],
    });
  };

  const handleDietaryToggle = (tag: DietaryTag) => {
    const isPresent = userProfile.preferences.dietaryRestrictions.includes(tag);
    const newTags = isPresent
      ? userProfile.preferences.dietaryRestrictions.filter((t) => t !== tag)
      : [...userProfile.preferences.dietaryRestrictions, tag];

    updateUserProfile({
      preferences: {
        ...userProfile.preferences,
        dietaryRestrictions: newTags,
      },
    });
  };

  const languages = [
    { code: 'en', name: 'English 🇺🇸' },
    { code: 'es', name: 'Español 🇪🇸' },
    { code: 'fr', name: 'Français 🇫🇷' },
    { code: 'pt', name: 'Português 🇧🇷' },
    { code: 'ar', name: 'العربية 🇸🇦' },
    { code: 'hi', name: 'हिन्दी 🇮🇳' },
    { code: 'ja', name: '日本語 🇯🇵' },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold font-outfit text-white">Preferences & Accessibility</h3>
        <p className="text-xs text-white/50">Personalize your FANVERSE AI stadium assistant experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: General Profile & Language */}
        <div className="space-y-6">
          {/* User Details */}
          <div className="p-4 bg-[#0A0E27] rounded-xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Smile className="w-4 h-4" /> General Profile
            </h4>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase">Fan Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => updateUserProfile({ name: e.target.value })}
                  placeholder="e.g. Ahmed, Maria..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase">Supporting Team</label>
                <input
                  type="text"
                  value={userProfile.preferences.favoriteTeam}
                  onChange={(e) =>
                    updateUserProfile({
                      preferences: { ...userProfile.preferences, favoriteTeam: e.target.value },
                    })
                  }
                  placeholder="e.g. Argentina, USA..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Language selection */}
          <div className="p-4 bg-[#0A0E27] rounded-xl border border-white/5 space-y-3">
            <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-cyan-400">
              Preferred Language
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => updateUserProfile({ language: lang.code })}
                  className={`px-3 py-2 rounded-lg border text-left text-xs font-semibold transition-all ${
                    userProfile.language === lang.code
                      ? 'bg-cyan-500 border-cyan-400 text-[#0A0E27]'
                      : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary selection */}
          <div className="p-4 bg-[#0A0E27] rounded-xl border border-white/5 space-y-3">
            <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> Dietary Preferences
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {(['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher'] as DietaryTag[]).map((tag) => {
                const isSelected = userProfile.preferences.dietaryRestrictions.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleDietaryToggle(tag)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium capitalize transition-all ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-400 text-[#0A0E27] shadow shadow-cyan-500/10'
                        : 'bg-white/5 border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Accessibility preferences */}
        <div className="space-y-6">
          {/* Wheelchair, elderly alerts */}
          <div className="p-4 bg-[#0A0E27] rounded-xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Physical Accessibility
            </h4>
            <p className="text-[10px] text-white/40 leading-relaxed">
              Enabling these preferences instructs the AI navigation engine to route you through step-free pathways, elevators, and low-traffic areas.
            </p>

            <div className="space-y-3">
              {[
                { key: 'wheelchair', label: 'Wheelchair / Step-free routing', desc: 'Prioritizes ramps and elevators.' },
                { key: 'elderly', label: 'Elderly assistance routing', desc: 'Reroutes via shorter walking steps.' },
                { key: 'visualImpairment', label: 'Visual assistant cues', desc: 'Applies larger indicators and descriptors.' },
                { key: 'hearingImpairment', label: 'Tactile & visual alert boost', desc: 'Sends vibrations and notifications.' },
              ].map((item) => {
                const isSelected = userProfile.accessibility[item.key as keyof typeof userProfile.accessibility];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleAccessibilityToggle(item.key as 'wheelchair' | 'visualImpairment' | 'hearingImpairment' | 'elderly')}
                    className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-all ${
                      isSelected ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-white font-outfit block">{item.label}</span>
                      <span className="text-[9px] text-white/40 block mt-0.5">{item.desc}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${isSelected ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition-all ${isSelected ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* UI Contrast & Text overrides */}
          <div className="p-4 bg-[#0A0E27] rounded-xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Display Overrides
            </h4>

            <div className="space-y-3">
              {[
                { key: 'highContrast', label: 'High Contrast Mode', desc: 'Enforces pitch black background with neon green borders.' },
                { key: 'largeText', label: 'Large Text', desc: 'Scale font sizes for better outdoor visibility.' },
                { key: 'voiceNavigation', label: 'Voice-directed navigation feedback', desc: 'AI reads layout turns aloud.' },
              ].map((item) => {
                const isSelected = accessibilityMode[item.key as keyof typeof accessibilityMode];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleDisplayToggle(item.key as 'highContrast' | 'largeText' | 'voiceNavigation')}
                    className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-all ${
                      isSelected ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-white font-outfit block">{item.label}</span>
                      <span className="text-[9px] text-white/40 block mt-0.5">{item.desc}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${isSelected ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition-all ${isSelected ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
