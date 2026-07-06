import React, { useState } from 'react';
import { ContentItem } from '../types';
import { Search, MapPin, Star, Sparkles, Filter, Grid, Map } from 'lucide-react';

interface DiscoveryScreenProps {
  items: ContentItem[];
  onSelectItem: (item: ContentItem) => void;
}

export default function DiscoveryScreen({ items, onSelectItem }: DiscoveryScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight font-title-lg">
          Where is your destiny tonight?
        </h2>
        <p className="text-[#ccc3d8] text-sm mt-1">
          Explore dining, academic sanctuaries, and custom trajectories curated for your path.
        </p>
      </div>

      {/* Search and Mode Toggles */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#ccc3d8]/60 pointer-events-none">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-[#102034]/60 border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all placeholder:text-[#ccc3d8]/40 text-sm"
            placeholder="Search culinary experiments, colleges, or natural sanctuaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* View toggles */}
        <div className="flex bg-[#102034]/40 border border-white/10 rounded-xl p-1 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-[#7c3aed] text-white' : 'text-[#ccc3d8] hover:text-white'
            }`}
          >
            <Grid size={14} />
            <span>Grid view</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              viewMode === 'map' ? 'bg-[#7c3aed] text-white' : 'text-[#ccc3d8] hover:text-white'
            }`}
          >
            <Map size={14} />
            <span>Map view</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'all', label: '🌟 All Destiny Paths' },
          { id: 'food', label: '🍽️ Food & Dining' },
          { id: 'college', label: '🎓 Academic Sanctuary' },
          { id: 'travel', label: '🧭 Hidden Gems' },
          { id: 'tech', label: '💻 Tech Marvels' },
          { id: 'wellness', label: '🧘 Wellness Retreats' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#d2bbff] border-[#d2bbff] text-[#25005a] shadow-[0_0_12px_rgba(210,187,255,0.4)]'
                : 'bg-[#102034]/40 border-white/5 text-[#ccc3d8] hover:border-white/15'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {viewMode === 'grid' ? (
        filteredItems.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl">
            <Sparkles size={40} className="mx-auto text-gray-500 mb-4 animate-pulse" />
            <p className="text-gray-400 font-bold mb-1">No Alignments Detected</p>
            <p className="text-gray-500 text-xs">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group flex flex-col md:flex-row bg-[#102034]/40 rounded-2xl border border-white/5 overflow-hidden hover:border-[#7c3aed]/20 transition-all cursor-pointer hover:bg-[#102034]/60 divine-glow"
              >
                {/* Image */}
                <div className="w-full md:w-2/5 h-48 md:h-auto overflow-hidden relative shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.matchPercentage && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#d2bbff]">
                      {item.matchPercentage}% Match
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#d2bbff]">
                        {item.subtitle}
                      </span>
                      {item.rating && (
                        <div className="flex items-center gap-1 text-[#d2bbff]">
                          <Star size={12} className="fill-[#d2bbff]" />
                          <span className="text-xs font-bold">{item.rating}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#d2bbff] transition-all mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#ccc3d8] line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {item.distance || item.location || 'London, UK'}
                    </span>
                    <span className="uppercase text-[#7c3aed] font-bold tracking-wider">
                      {item.rank || 'VIEW PATH'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Animated Map View Placeholder (gorgeous brutalist outline design) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
          {/* Side list */}
          <div className="lg:col-span-1 border border-white/10 rounded-2xl bg-[#102034]/40 overflow-y-auto no-scrollbar p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">Nearby Destinies</h3>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-3.5 rounded-xl border border-white/5 bg-black/20 hover:border-[#7c3aed]/30 hover:bg-[#102034]/40 transition-all cursor-pointer flex gap-3"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{item.subtitle}</p>
                  <p className="text-[9px] text-[#d2bbff] font-bold mt-1">{item.distance || item.location || 'London'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Glowing Neon Map Canvas */}
          <div className="lg:col-span-2 relative border border-white/10 rounded-2xl overflow-hidden bg-[#000d1a] flex items-center justify-center p-6">
            {/* Holographic grid scan lines */}
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15),transparent)] pointer-events-none" />

            {/* Glowing path lines */}
            <svg className="absolute inset-0 w-full h-full text-[#7c3aed]/20 stroke-current" strokeDasharray="5,5">
              <line x1="20%" y1="30%" x2="50%" y2="60%" strokeWidth="1.5" />
              <line x1="50%" y1="60%" x2="80%" y2="40%" strokeWidth="1.5" />
              <line x1="50%" y1="60%" x2="40%" y2="80%" strokeWidth="1.5" />
            </svg>

            {/* Map nodes */}
            {filteredItems.slice(0, 5).map((item, index) => {
              // Custom map positions
              const positions = [
                { top: '30%', left: '20%' },
                { top: '60%', left: '50%' },
                { top: '40%', left: '80%' },
                { top: '80%', left: '40%' },
                { top: '25%', left: '65%' }
              ];
              const pos = positions[index] || { top: '50%', left: '50%' };

              return (
                <div
                  key={item.id}
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => onSelectItem(item)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  {/* Glowing Node ring */}
                  <div className="absolute inset-0 -m-3 border border-[#7c3aed] rounded-full scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 animate-ping" />
                  
                  <div className="relative w-8 h-8 bg-[#0b1c30] border border-[#7c3aed] rounded-full flex items-center justify-center text-xs font-bold text-[#d2bbff] shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:scale-110 hover:bg-[#7c3aed] hover:text-white transition-all">
                    {index + 1}
                  </div>

                  {/* Popover info tag */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 border border-white/15 px-3 py-1.5 rounded-lg text-[10px] text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl pointer-events-none">
                    <span className="font-bold block">{item.title}</span>
                    <span className="text-gray-400 font-mono text-[8px] uppercase">{item.matchPercentage}% Alignment</span>
                  </div>
                </div>
              );
            })}

            {/* HUD Status Bar Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-[#031427]/80 backdrop-blur-md border border-white/5 rounded-lg px-4 py-2.5 flex justify-between items-center text-[9px] font-mono uppercase tracking-wider text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                GPS Coordinates: Aligned to London Core
              </span>
              <span>Scanning Trajectories...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
