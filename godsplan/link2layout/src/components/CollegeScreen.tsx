import React, { useState } from 'react';
import { ContentItem } from '../types';
import { GraduationCap, ArrowRight, ShieldCheck, HelpCircle, Check, Star, RefreshCw, X } from 'lucide-react';

interface CollegeScreenProps {
  items: ContentItem[];
  onSelectItem: (item: ContentItem) => void;
}

export default function CollegeScreen({ items, onSelectItem }: CollegeScreenProps) {
  const colleges = items.filter(it => it.category === 'college');
  const [compareList, setCompareList] = useState<ContentItem[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  const toggleCompare = (college: ContentItem) => {
    const isAdded = compareList.find(c => c.id === college.id);
    if (isAdded) {
      setCompareList(compareList.filter(c => c.id !== college.id));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 colleges at once on your timeline.");
        return;
      }
      setCompareList([...compareList, college]);
      setShowCompareDrawer(true);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 font-title-lg">
            <GraduationCap className="text-[#7c3aed]" />
            <span>Divine Matchmaking</span>
          </h2>
          <p className="text-[#ccc3d8] text-sm mt-1">
            Analyze elite universities, tuition guides, admission odds, and living parameters.
          </p>
        </div>

        {compareList.length > 0 && (
          <button
            onClick={() => setShowCompareDrawer(true)}
            className="px-4 py-2 bg-[#7c3aed] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:bg-[#7c3aed]/80"
          >
            <RefreshCw size={12} className="animate-spin-slow" />
            <span>Compare ({compareList.length})</span>
          </button>
        )}
      </div>

      {/* College List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {colleges.map((item) => {
          const isComparing = compareList.some(c => c.id === item.id);
          return (
            <div
              key={item.id}
              className="bg-[#102034]/40 rounded-2xl border border-white/5 overflow-hidden hover:border-[#7c3aed]/20 transition-all duration-300 flex flex-col justify-between divine-glow"
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#000f21] border border-white/10 shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#d2bbff] block">
                        {item.subtitle}
                      </span>
                      <h3
                        onClick={() => onSelectItem(item)}
                        className="font-bold text-lg text-white hover:text-[#d2bbff] transition-colors cursor-pointer mt-0.5"
                      >
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <span className="bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[#d2bbff] px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                    {item.rank || 'RANKED'}
                  </span>
                </div>

                <p className="text-xs text-[#ccc3d8] leading-relaxed">
                  {item.description}
                </p>

                {/* Vital metrics */}
                <div className="grid grid-cols-3 gap-3 bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-gray-400">NIRF / Index</span>
                    <span className="text-white text-xs font-bold font-mono mt-0.5 block">
                      {item.details?.stats?.["NIRF Rank"] || item.details?.stats?.["Popularity Index"] || "Top Tier"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-gray-400">Median Pack</span>
                    <span className="text-white text-xs font-bold font-mono mt-0.5 block">
                      {item.details?.stats?.["Average Placement"] || item.details?.stats?.["Admission Status"] || "Flexible"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-gray-400">Tuition Fee</span>
                    <span className="text-[#d2bbff] text-xs font-bold font-mono mt-0.5 block line-clamp-1 px-1">
                      {item.details?.priceGuide || "$$$"}
                    </span>
                  </div>
                </div>

                {/* Courses Offered Preview */}
                {item.details?.courses && item.details.courses.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Featured Trajectories</span>
                    <div className="space-y-1">
                      {item.details.courses.slice(0, 2).map((course, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded text-[10px]">
                          <span className="text-white font-medium line-clamp-1">{course.name}</span>
                          <span className="text-gray-400 shrink-0 ml-2 font-mono text-[9px]">{course.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
                <button
                  onClick={() => onSelectItem(item)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Explore Courses</span>
                  <ArrowRight size={12} />
                </button>
                <button
                  onClick={() => toggleCompare(item)}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border cursor-pointer ${
                    isComparing
                      ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                      : 'border-white/15 text-[#ccc3d8] hover:border-white/30'
                  }`}
                >
                  {isComparing ? 'Comparing' : 'Compare'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Drawer / Comparison Modal Overlay */}
      {showCompareDrawer && compareList.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#102034] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <RefreshCw className="text-[#d2bbff] animate-spin-slow" size={20} />
                  <span>Interactive Trajectory Comparison</span>
                </h3>
                <p className="text-xs text-gray-400">Contrasting top academic choices based on admission data & tuition fees.</p>
              </div>
              <button
                onClick={() => setShowCompareDrawer(false)}
                className="p-2 hover:bg-white/5 rounded-full text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {compareList.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-4 relative">
                    <button
                      onClick={() => toggleCompare(item)}
                      className="absolute top-3 right-3 p-1 hover:bg-white/5 rounded-full text-gray-400 hover:text-white"
                      title="Remove comparison"
                    >
                      <X size={14} />
                    </button>

                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden mx-auto border border-white/10 bg-[#000f21] mb-2">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-[#d2bbff]">{item.subtitle}</span>
                      <h4 className="font-bold text-white text-sm line-clamp-1 mt-0.5">{item.title}</h4>
                    </div>

                    <div className="space-y-3.5 pt-3 border-t border-white/5 text-xs">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block mb-1">Tuition & Pricing</span>
                        <span className="text-[#d2bbff] font-bold font-mono">{item.details?.priceGuide || 'Top Tier'}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block mb-1">Rankings & Standing</span>
                        <span className="text-white font-mono font-bold">
                          {item.details?.stats?.["NIRF Rank"] || item.details?.stats?.["Popularity Index"] || "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block mb-1">Estimated Placement</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {item.details?.stats?.["Average Placement"] || 'High ROI'}
                        </span>
                      </div>

                      {item.details?.courses && (
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase block mb-1">Available Seats</span>
                          <div className="space-y-1 font-mono text-[10px] bg-white/[0.02] p-2 rounded">
                            {item.details.courses.map((c, i) => (
                              <div key={i} className="flex justify-between border-b border-white/5 pb-1 last:border-0 last:pb-0">
                                <span className="text-gray-300 truncate max-w-[120px]">{c.name}</span>
                                <span className="text-white">{c.intake}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add more placeholder slot */}
                {compareList.length < 3 && (
                  <div className="border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-white/[0.01]">
                    <GraduationCap size={28} className="text-gray-600 mb-2" />
                    <p className="text-xs text-gray-400">Add up to 3 institutions to cross-evaluate placements.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setCompareList([])}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-white/15 hover:border-white/30 text-gray-300 rounded-lg active:scale-95 transition-all"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowCompareDrawer(false)}
                className="px-6 py-2 bg-[#7c3aed] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#7c3aed]/80 active:scale-95 transition-all"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
