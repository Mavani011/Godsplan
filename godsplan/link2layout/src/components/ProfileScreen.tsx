import React, { useState } from 'react';
import { UserProfile, ContentItem } from '../types';
import { updatePreferences, logoutUser } from '../api';
import { Shield, Sparkles, Brain, Sliders, LogOut, Heart, BookOpen, Star, LayoutGrid, Check } from 'lucide-react';

interface ProfileScreenProps {
  user: UserProfile;
  items: ContentItem[];
  savedItemIds: string[];
  onSelectItem: (item: ContentItem) => void;
  onLogout: () => void;
  onOpenCMS: () => void;
}

export default function ProfileScreen({ user, items, savedItemIds, onSelectItem, onLogout, onOpenCMS }: ProfileScreenProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [aiIntensity, setAiIntensity] = useState(user.preferences.aiIntensity || 85);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(user.preferences.cuisine || ['Organic', 'Minimalist']);
  const [selectedEdu, setSelectedEdu] = useState<string[]>(user.preferences.education || ['Design Philosophy']);
  const [selectedDest, setSelectedDest] = useState<string[]>(user.preferences.destinations || ['Quiet Luxury']);
  const [isSaved, setIsSaved] = useState(false);

  // Filter bookmarked items
  const savedItems = items.filter(it => savedItemIds.includes(it.id));

  const cuisinesOptions = ['Organic', 'Minimalist', 'Spicy Szechuan', 'Japanese Fusion', 'French Modern', 'Clean Bowls'];
  const eduOptions = ['Design Philosophy', 'Data Science', 'Neural Engineering', 'Entrepreneurship', 'AI & Machine Learning'];
  const destOptions = ['Architectural Marvels', 'Quiet Luxury', 'Bioluminescent Sanctum', 'Sub-terranean lounges', 'Redwood Forests'];

  const toggleOption = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaved(true);
    const newPrefs = {
      cuisine: selectedCuisines,
      education: selectedEdu,
      destinations: selectedDest,
      aiIntensity: Number(aiIntensity)
    };
    try {
      await updatePreferences(user.uid, newPrefs);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error(e);
      setIsSaved(false);
    }
  };

  const handleLogoutClick = async () => {
    if (window.confirm("Disconnect your alignment timeline?")) {
      await logoutUser();
      onLogout();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Banner / ID Card */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#102034]/40 p-6 md:p-8 divine-glow flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="absolute top-0 right-0 -z-10 w-80 h-80 bg-[#7c3aed]/5 rounded-full blur-[60px]" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar with Pioneer Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full border-2 border-[#7c3aed] p-1 shadow-[0_0_20px_rgba(124,58,237,0.3)] bg-black/40 flex items-center justify-center text-3xl font-black text-[#d2bbff]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#7c3aed] border border-white/10 p-1 rounded-full text-white" title="Verified Pioneer">
              <Shield size={12} className="fill-current" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white">{displayName}</h2>
              <span className="bg-[#7c3aed]/20 text-[#d2bbff] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-[#7c3aed]/20">
                Verified Pioneer
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
            <p className="text-[10px] font-mono text-[#7c3aed] uppercase tracking-wider mt-1.5 flex items-center gap-1 justify-center sm:justify-start">
              <Sparkles size={10} className="animate-pulse" />
              <span>EARLY ACCESS TIER • CORE MEMORY LOGGED</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            onClick={onOpenCMS}
            className="px-5 py-2.5 bg-gradient-to-r from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
          >
            <LayoutGrid size={14} />
            <span>Divine CMS Console</span>
          </button>
          
          <button
            onClick={handleLogoutClick}
            className="px-4 py-2.5 border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-300 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Intelligence Preferences (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 md:p-8 bg-[#102034]/20 border border-white/5 rounded-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Brain className="text-[#7c3aed]" size={18} />
                <span>Intelligence Preferences</span>
              </h3>
              
              <button
                onClick={handleSavePreferences}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                  isSaved
                    ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-[#7c3aed] text-white hover:bg-[#7c3aed]/80'
                }`}
              >
                {isSaved ? <Check size={12} /> : null}
                <span>{isSaved ? 'Aligned' : 'Save Preferences'}</span>
              </button>
            </div>

            {/* AI Intensity Alignment */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#d3e4fe] uppercase tracking-wider">AI Intensity / Predictive Accuracy</span>
                <span className="text-[#d2bbff] font-mono font-bold">{aiIntensity}% Accurate Alignment</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                className="w-full accent-[#7c3aed]"
                value={aiIntensity}
                onChange={(e) => setAiIntensity(Number(e.target.value))}
              />
              <p className="text-[10px] text-gray-400">Controls the predictive model threshold. Higher values prioritize highly curated boutique alignment suggestions.</p>
            </div>

            {/* Culinary Toggles */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-white uppercase tracking-wider">Culinary Path Tastes</span>
              <div className="flex flex-wrap gap-2">
                {cuisinesOptions.map((item) => {
                  const isSel = selectedCuisines.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleOption(selectedCuisines, setSelectedCuisines, item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-[#d2bbff]/10 border-[#d2bbff] text-[#d2bbff]'
                          : 'bg-black/15 border-white/5 text-gray-400 hover:border-white/15'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Academic Spec Toggles */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-white uppercase tracking-wider">Academic Interest Disciplines</span>
              <div className="flex flex-wrap gap-2">
                {eduOptions.map((item) => {
                  const isSel = selectedEdu.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleOption(selectedEdu, setSelectedEdu, item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-[#d2bbff]/10 border-[#d2bbff] text-[#d2bbff]'
                          : 'bg-black/15 border-white/5 text-gray-400 hover:border-white/15'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Toggles */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-white uppercase tracking-wider">Destiny Locations & Vibes</span>
              <div className="flex flex-wrap gap-2">
                {destOptions.map((item) => {
                  const isSel = selectedDest.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleOption(selectedDest, setSelectedDest, item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-[#d2bbff]/10 border-[#d2bbff] text-[#d2bbff]'
                          : 'bg-black/15 border-white/5 text-gray-400 hover:border-white/15'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Plans (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-[#102034]/20 border border-white/5 rounded-2xl space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2 border-b border-white/5 pb-4">
              <Heart className="text-[#7c3aed]" size={18} />
              <span>Saved Destiny Plans</span>
            </h3>

            {savedItems.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/5 rounded-xl text-xs text-gray-500">
                Your bookmarks timeline is currently clear. Save recommendations to see them here!
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                {savedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="p-3 bg-[#102034]/40 hover:bg-[#102034]/60 border border-white/5 hover:border-white/15 rounded-xl transition-all cursor-pointer flex gap-3 items-center"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-[#000f21]">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.subtitle}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[8px] uppercase tracking-wider text-[#d2bbff] bg-[#d2bbff]/5 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">{item.matchPercentage}% Match</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
