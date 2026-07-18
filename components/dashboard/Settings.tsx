'use client';

import React from 'react';
import { useFanverseStore } from '@/lib/store';
import { Shield, Eye, Flame, Smile } from 'lucide-react';
import type { DietaryTag } from '@/types';
import { t } from '@/lib/i18n';

/**
 * Settings Dashboard Component.
 * Allows the user to toggle accessibility settings (wheelchair accessibility routing, large text contrast, voice directions),
 * manage World Cup dietary preferences, and configure language profiles.
 *
 * @returns React.JSX.Element representing the user settings panel.
 */
export default function Settings(): React.JSX.Element {
  const userProfile = useFanverseStore((state) => state.userProfile);
  const accessibilityMode = useFanverseStore((state) => state.accessibilityMode);
  const updateUserProfile = useFanverseStore((state) => state.updateUserProfile);
  const setAccessibility = useFanverseStore((state) => state.setAccessibility);

  /**
   * Toggles individual user accessibility features inside userProfile store.
   *
   * @param key The specific accessibility setting key.
   * @returns void
   */
  const handleAccessibilityToggle = (key: 'wheelchair' | 'visualImpairment' | 'hearingImpairment' | 'elderly'): void => {
    updateUserProfile({
      accessibility: {
        ...userProfile.accessibility,
        [key]: !userProfile.accessibility[key],
      },
    });
  };

  /**
   * Toggles general display overrides like high contrast or large font sizing inside accessibilityMode store.
   *
   * @param key The specific display override key.
   * @returns void
   */
  const handleDisplayToggle = (key: 'highContrast' | 'largeText' | 'voiceNavigation'): void => {
    setAccessibility({
      [key]: !accessibilityMode[key],
    });
  };

  const handleDietaryToggle = (tag: DietaryTag): void => {
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
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold font-outfit text-white">{t('settingsTitle', userProfile.language)}</h3>
        <p className="text-xs text-white/70">Personalize your FANVERSE AI stadium assistant experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: General Profile & Language */}
        <div className="space-y-6">
          {/* User Details */}
          <div className="p-4 bg-[#0A0E27] rounded-xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Smile className="w-4 h-4" aria-hidden="true" /> General Profile
            </h4>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="fan-name" className="text-[10px] text-white/70 uppercase block font-semibold">Name</label>
                <input
                  id="fan-name"
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => updateUserProfile({ name: e.target.value })}
                  placeholder="e.g. Ahmed, Maria..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="favorite-team" className="text-[10px] text-white/70 uppercase block font-semibold">Supporting Team</label>
                <input
                  id="favorite-team"
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

              {/* Active Role Selector (Problem Alignment: Operations Support) */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-white/70 uppercase block font-semibold">Active Mode</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateUserProfile({ role: 'fan' })}
                    className={`px-3 py-1.5 rounded-lg border text-center text-xs font-semibold transition-all ${
                      userProfile.role === 'fan'
                        ? 'bg-cyan-500 border-cyan-400 text-[#0A0E27]'
                        : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Fan Mode
                  </button>
                  <button
                    onClick={() => updateUserProfile({ role: 'staff' })}
                    className={`px-3 py-1.5 rounded-lg border text-center text-xs font-semibold transition-all ${
                      userProfile.role === 'staff'
                        ? 'bg-amber-500 border-amber-400 text-[#0A0E27]'
                        : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Operations Staff
                  </button>
                </div>
              </div>

              {/* GreenGoal Sustainability Gamification */}
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">GreenGoal™ Carbon Saved</span>
                  <span className="text-xs font-black text-emerald-300">{userProfile.sustainabilityPoints} PTS</span>
                </div>
                <p className="text-[9px] text-emerald-100/70 leading-relaxed">
                  Earn points by taking public transit (NJ Transit) or utilizing recycling hubs in sections F & K.
                </p>
                {userProfile.sustainabilityPoints === 0 && (
                  <button
                    onClick={() => updateUserProfile({ sustainabilityPoints: 50 })}
                    className="w-full py-1 bg-emerald-500 hover:bg-emerald-600 text-[#0A0E27] font-black text-[9px] uppercase tracking-wider rounded transition-all active:scale-[0.98]"
                  >
                    Claim transit points (+50 pts)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Language selection */}
          <div className="p-4 bg-[#0A0E27] rounded-xl border border-white/5 space-y-3">
            <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-cyan-400">
              Preferred Language
            </h4>
            
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Preferred Language selection">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => updateUserProfile({ language: lang.code })}
                  className={`px-3 py-2 rounded-lg border text-left text-xs font-semibold transition-all ${
                    userProfile.language === lang.code
                      ? 'bg-cyan-500 border-cyan-400 text-[#0A0E27]'
                      : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  aria-pressed={userProfile.language === lang.code}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary selection */}
          <div className="p-4 bg-[#0A0E27] rounded-xl border border-white/5 space-y-3">
            <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4" aria-hidden="true" /> Dietary Preferences
            </h4>
            
            <div className="flex flex-wrap gap-2" role="group" aria-label="Dietary preferences selection">
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
                    aria-pressed={isSelected}
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
              <Shield className="w-4 h-4" aria-hidden="true" /> Physical Accessibility
            </h4>
            <p className="text-[10px] text-white/70 leading-relaxed">
              Enabling these preferences instructs the AI navigation engine to route you through step-free pathways, elevators, and low-traffic areas.
            </p>

            <div className="space-y-3" role="group" aria-label="Physical accessibility overrides">
              {[
                { key: 'wheelchair', label: 'Wheelchair / Step-free routing', desc: 'Prioritizes ramps and elevators.' },
                { key: 'elderly', label: 'Elderly assistance routing', desc: 'Reroutes via shorter walking steps.' },
                { key: 'visualImpairment', label: 'Visual assistant cues', desc: 'Applies larger indicators and descriptors.' },
                { key: 'hearingImpairment', label: 'Tactile & visual alert boost', desc: 'Sends vibrations and notifications.' },
              ].map((item) => {
                const isSelected = userProfile.accessibility[item.key as keyof typeof userProfile.accessibility];
                return (
                  <button
                    key={item.key}
                    onClick={() => handleAccessibilityToggle(item.key as 'wheelchair' | 'visualImpairment' | 'hearingImpairment' | 'elderly')}
                    className={`w-full p-3 rounded-lg border flex justify-between items-center text-left transition-all cursor-pointer ${
                      isSelected ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                    role="switch"
                    aria-checked={isSelected}
                    aria-label={`${item.label}: ${item.desc}`}
                  >
                    <div>
                      <span className="font-bold text-xs text-white font-outfit block">{item.label}</span>
                      <span className="text-[9px] text-white/70 block mt-0.5">{item.desc}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-all shrink-0 ${isSelected ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition-all ${isSelected ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* UI Contrast & Text overrides */}
          <div className="p-4 bg-[#0A0E27] rounded-xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" aria-hidden="true" /> Display Overrides
            </h4>

            <div className="space-y-3" role="group" aria-label="Display overrides">
              {[
                { key: 'highContrast', label: 'High Contrast Mode', desc: 'Enforces pitch black background with neon green borders.' },
                { key: 'largeText', label: 'Large Text', desc: 'Scale font sizes for better outdoor visibility.' },
                { key: 'voiceNavigation', label: 'Voice-directed navigation feedback', desc: 'AI reads layout turns aloud.' },
              ].map((item) => {
                const isSelected = accessibilityMode[item.key as keyof typeof accessibilityMode];
                return (
                  <button
                    key={item.key}
                    onClick={() => handleDisplayToggle(item.key as 'highContrast' | 'largeText' | 'voiceNavigation')}
                    className={`w-full p-3 rounded-lg border flex justify-between items-center text-left transition-all cursor-pointer ${
                      isSelected ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                    role="switch"
                    aria-checked={isSelected}
                    aria-label={`${item.label}: ${item.desc}`}
                  >
                    <div>
                      <span className="font-bold text-xs text-white font-outfit block">{item.label}</span>
                      <span className="text-[9px] text-white/70 block mt-0.5">{item.desc}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-all shrink-0 ${isSelected ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition-all ${isSelected ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
