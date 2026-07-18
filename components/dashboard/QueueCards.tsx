'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useFanverseStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, User, Clock, Award } from 'lucide-react';
import type { FoodVendor } from '@/types';
import { getSensoryStatusColor } from '@/lib/utils';

/**
 * QueueCards Dashboard Component.
 * Displays wait times and line sizes for MetLife food vendors and restrooms.
 * Automatically recommends the shortest queues utilizing user dietary tags.
 *
 * @returns React.JSX.Element representing queue lists.
 */
export default function QueueCards(): React.JSX.Element {
  const stadiumState = useFanverseStore((state) => state.stadiumState);
  const userProfile = useFanverseStore((state) => state.userProfile);
  const [activeTab, setActiveTab] = useState<'restroom' | 'food'>('food');

  // Filter facilities/vendors with useMemo for optimal render execution
  const restrooms = useMemo(() => {
    return stadiumState.facilities
      .filter((f) => f.type === 'restroom' && f.open)
      .sort((a, b) => a.waitMinutes - b.waitMinutes);
  }, [stadiumState.facilities]);

  const foodVendors = useMemo(() => {
    return stadiumState.foodVendors
      .filter((v) => v.open)
      .sort((a, b) => a.waitMinutes - b.waitMinutes);
  }, [stadiumState.foodVendors]);

  // Apply user profile filters for recommendations
  const matchDiet = useCallback((vendor: FoodVendor): boolean => {
    if (userProfile.preferences.dietaryRestrictions.length === 0) return true;
    return userProfile.preferences.dietaryRestrictions.some((tag) =>
      vendor.dietaryTags.includes(tag)
    );
  }, [userProfile.preferences.dietaryRestrictions]);

  const recommendedFood = useMemo(() => {
    return foodVendors.filter(matchDiet);
  }, [foodVendors, matchDiet]);

  const displayFood = useMemo(() => {
    return recommendedFood.length > 0 ? recommendedFood : foodVendors;
  }, [recommendedFood, foodVendors]);

  const handleNavigate = useCallback((name: string, zoneOrCuisine: string, type: 'food' | 'restroom') => {
    const now = Date.now();
    // Add User message asking for directions
    useFanverseStore.getState().addMessage({
      id: `nav-query-${now}`,
      role: 'user',
      content: `How do I get to ${name}?`,
      timestamp: now,
      type: 'text',
    });

    // Switch view to chat
    useFanverseStore.getState().setActiveView('chat');

    // Simulate AI response for navigation directions
    const isWheelchair = userProfile.accessibility.wheelchair;
    setTimeout(() => {
      const respTime = Date.now();
      useFanverseStore.getState().addMessage({
        id: `nav-answer-${respTime}`,
        role: 'assistant',
        content: `🧭 **Directions to ${name}:**\n\n1. From your current section, turn left and follow the main concourse corridor East.\n2. Proceed past the section entrance signs towards Section ${type === 'restroom' ? zoneOrCuisine : 'D'}.\n3. ${
          isWheelchair
            ? 'Take the Section F elevator down to the concourse floor.'
            : 'Walk down the Section F stairwell to the concourse level.'
        }\n4. ${name} is situated directly on the right (look for the illuminated signboard).\n\n*Estimated walking time: 3-5 minutes.*`,
        timestamp: respTime,
        type: 'route',
      });
    }, 800);
  }, [userProfile.accessibility.wheelchair]);

  const lowestRestroom = restrooms[0];
  const lowestFood = displayFood[0];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('food')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'food'
              ? 'bg-cyan-500 text-[#0A0E27] shadow-lg shadow-cyan-500/25'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Dining & Vendors</span>
        </button>
        <button
          onClick={() => setActiveTab('restroom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'restroom'
              ? 'bg-cyan-500 text-[#0A0E27] shadow-lg shadow-cyan-500/25'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Restrooms</span>
        </button>
      </div>

      {/* Lists */}
      <AnimatePresence mode="wait">
        {activeTab === 'food' ? (
          <motion.div
            key="food-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {displayFood.slice(0, 4).map((vendor) => {
              const isRecommended = vendor.id === lowestFood?.id;
              return (
                <div
                  key={vendor.id}
                  onClick={() => handleNavigate(vendor.name, vendor.cuisine, 'food')}
                  className={`relative p-4 rounded-xl border flex flex-col justify-between h-[130px] hover:bg-white/5 cursor-pointer active:scale-[0.98] transition-all ${
                    isRecommended ? 'border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/5' : 'border-white/10 bg-white/0'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-outfit">
                          {vendor.name}
                        </span>
                        {isRecommended && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-cyan-500 text-[#0A0E27] font-black text-[9px] uppercase tracking-wider">
                            <Award className="w-2.5 h-2.5" /> AI Pick
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-white/50">{vendor.cuisine} cuisine</span>
                    </div>

                    <div className={`px-2 py-1 rounded-lg border text-xs font-black flex items-center gap-1 ${getSensoryStatusColor(vendor.waitMinutes, 12)}`}>
                      <Clock className="w-3 h-3" />
                      <span>{vendor.waitMinutes} min</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    {/* Menu snippet */}
                    <div className="text-[10px] text-white/40 max-w-[150px] truncate">
                      ⭐ {vendor.menuHighlights.join(', ')}
                    </div>
                    {/* Queue indicator */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400"
                          style={{ width: `${Math.min(100, (vendor.queueLength / 30) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/60">{vendor.queueLength} in line</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="restroom-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {restrooms.slice(0, 4).map((fac) => {
              const isRecommended = fac.id === lowestRestroom?.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => handleNavigate(fac.name, fac.zone, 'restroom')}
                  className={`relative p-4 rounded-xl border flex flex-col justify-between h-[130px] hover:bg-white/5 cursor-pointer active:scale-[0.98] transition-all ${
                    isRecommended ? 'border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/5' : 'border-white/10 bg-white/0'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-outfit">
                          {fac.name}
                        </span>
                        {isRecommended && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-cyan-500 text-[#0A0E27] font-black text-[9px] uppercase tracking-wider">
                            <Award className="w-2.5 h-2.5" /> AI Pick
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-white/50">Section {fac.zone}</span>
                    </div>

                    <div className={`px-2 py-1 rounded-lg border text-xs font-black flex items-center gap-1 ${getSensoryStatusColor(fac.waitMinutes, 12)}`}>
                      <Clock className="w-3 h-3" />
                      <span>{fac.waitMinutes} min</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-[10px] text-white/40">
                      {fac.accessible ? '♿ Accessible' : '⚠️ No ramp'}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400"
                          style={{ width: `${Math.min(100, (fac.queueLength / 25) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/60">{fac.queueLength} in line</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
