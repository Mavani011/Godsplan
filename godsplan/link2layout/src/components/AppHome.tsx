import React from 'react';
import { ContentItem, UserProfile } from '../types';
import { Sparkles, ArrowRight, Star, Clock, MapPin, ChevronRight, Activity, Calendar, Compass } from 'lucide-react';

interface AppHomeProps {
  user: UserProfile;
  items: ContentItem[];
  savedItemIds: string[];
  onSelectItem: (item: ContentItem) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function AppHome({ user, items, savedItemIds, onSelectItem, onNavigateToTab }: AppHomeProps) {
  // Find top matching item
  const topMatch = [...items].sort((a, b) => b.matchPercentage - a.matchPercentage)[0];

  // Specific categorizations for bento layout
  const featured = items.find(it => it.id === '1') || topMatch || items[0];
  const secondary = items.find(it => it.id === '8') || items[1];

  // Filter nearby items
  const nearbyItems = items.filter(it => it.category === 'travel' || it.category === 'food').slice(0, 3);

  const topMatchItem = () => {
    return featured || topMatch || items[0];
  };

  return (
    <div className="space-y-12">
      {/* Hero Greeting Section */}
      <section className="animate-fade-in">
        <p className="text-[#d2bbff] text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Divine Member,</p>
        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight font-title-lg">
          Good Morning, {user.displayName}
        </h2>
      </section>

      {/* Hero AI Recommendation Card */}
      {topMatch && (
        <section 
          className="relative group overflow-hidden rounded-2xl border border-white/10 bg-[#102034]/30 backdrop-blur-xl p-6 md:p-8 transition-all duration-500 hover:border-[#7c3aed]/40 divine-glow cursor-pointer" 
          onClick={() => onSelectItem(topMatch)}
        >
          <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-[#7c3aed]/10 rounded-full blur-[80px]" />
          <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-[#7c3aed]/20 text-[#d2bbff] px-4 py-1 rounded-full text-xs font-semibold border border-[#7c3aed]/20 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles size={12} className="animate-pulse" />
                  AI RECOMMENDATION
                </span>
                <span className="text-[#d2bbff] font-bold text-sm flex items-center gap-1">
                  <Star size={14} className="fill-[#d2bbff]" />
                  {topMatch.matchPercentage}% Match
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white leading-snug">
                Because your preferences align with {user.preferences.cuisine[0] || 'Organic'} food and {user.preferences.destinations[0] || 'Quiet Luxury'}, we've synchronized <span className="text-[#d2bbff] italic">"{topMatch.title}"</span> with your current timeline today.
              </h3>
              <p className="text-xs text-[#ccc3d8]">
                {topMatch.description}
              </p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(topMatchItem());
                }}
                className="w-full md:w-auto bg-[#7c3aed] hover:bg-[#7c3aed]/90 text-white px-6 py-3 rounded-full font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Plan</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Top Recommendations (Bento Grid Style) */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h4 className="text-2xl font-bold text-white">Top Recommendations</h4>
          <button 
            onClick={() => onNavigateToTab('discovery')}
            className="text-[#d2bbff] text-xs uppercase tracking-widest font-bold hover:underline cursor-pointer"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Featured Recommendation */}
          {featured ? (
            <div 
              onClick={() => onSelectItem(featured)}
              className="md:col-span-2 relative h-[360px] rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-[#7c3aed]/30 transition-all duration-500"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: `url('${featured.image}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#031427] via-[#031427]/30 to-transparent"></div>
              
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-[#d2bbff] border border-white/10">
                {featured.matchPercentage}% Match
              </div>

              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex gap-2 mb-2">
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#d2bbff]">
                    {featured.subtitle}
                  </span>
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                    {featured.rank || 'Highly Ranked'}
                  </span>
                </div>
                <h5 className="text-xl font-bold mb-1 text-white">{featured.title}</h5>
                <p className="text-[#ccc3d8] text-sm line-clamp-1">{featured.description}</p>
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 h-[360px] border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-xs text-gray-500">
              No featured recommendations loaded.
            </div>
          )}

          {/* Smaller Recommendation */}
          {secondary ? (
            <div 
              onClick={() => onSelectItem(secondary)}
              className="relative h-[360px] rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-[#7c3aed]/30 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                style={{ backgroundImage: `url('${secondary.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031427] via-[#031427]/20 to-transparent"></div>
              
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-[#d2bbff] border border-white/10">
                {secondary.matchPercentage}% Match
              </div>
              
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex gap-2 mb-2">
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#d2bbff]">
                    {secondary.subtitle}
                  </span>
                </div>
                <h5 className="text-xl font-bold mb-1 text-white">{secondary.title}</h5>
                <p className="text-[#ccc3d8] text-sm line-clamp-2">{secondary.description}</p>
              </div>
            </div>
          ) : (
            <div className="h-[360px] border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-xs text-gray-500">
              No recommendations loaded.
            </div>
          )}
        </div>
      </section>

      {/* Nearby Discovery */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h4 className="text-2xl font-bold text-white">Nearby Discovery</h4>
          <div className="flex items-center gap-2 text-[#ccc3d8]">
            <MapPin size={14} className="text-[#7c3aed]" />
            <span className="text-xs tracking-wider">London, UK</span>
          </div>
        </div>

        {nearbyItems.length === 0 ? (
          <div className="py-12 border border-dashed border-white/10 rounded-xl text-center text-xs text-gray-500">
            No nearby options matched your profile. Try modifying preferences.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="rounded-2xl overflow-hidden bg-[#102034]/40 border border-white/5 hover:border-[#7c3aed]/20 hover:bg-[#102034]/60 transition-all duration-300 group cursor-pointer"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    src={item.image} 
                    alt={item.title} 
                  />
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#d2bbff]">
                    {item.distance || 'Nearby'}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h6 className="font-bold text-lg text-white group-hover:text-[#d2bbff] transition-colors">{item.title}</h6>
                    <span className="text-xs text-[#ccc3d8] font-semibold uppercase">{item.category}</span>
                  </div>
                  <p className="text-xs text-[#ccc3d8] line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="bg-[#102034]/20 rounded-2xl border border-white/5 p-6">
        <h4 className="text-2xl font-bold text-white mb-6">Recent Activity</h4>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-[#102034]/40 border border-white/5 rounded-xl hover:border-white/10 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/20 flex items-center justify-center text-[#d2bbff] mr-4">
              <Activity size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Synchronized Divine Trajectory</p>
              <p className="text-xs text-[#ccc3d8]">Aligned preferences with computational model: 85% predictive mode active.</p>
            </div>
            <ChevronRight size={16} className="text-[#ccc3d8]/40" />
          </div>

          <div className="flex items-center p-4 bg-[#102034]/40 border border-white/5 rounded-xl hover:border-white/10 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/20 flex items-center justify-center text-[#d2bbff] mr-4">
              <Compass size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Discovered "The Celestial Garden"</p>
              <p className="text-xs text-[#ccc3d8]">Matches 'Bioluminescent Sanctuary' sub-profile logic.</p>
            </div>
            <ChevronRight size={16} className="text-[#ccc3d8]/40" />
          </div>
        </div>
      </section>
    </div>
  );
}
