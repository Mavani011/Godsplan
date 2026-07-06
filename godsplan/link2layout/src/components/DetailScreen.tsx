import React, { useState, useEffect } from 'react';
import { ContentItem, Review } from '../types';
import { getReviews, addReview, toggleSavedPlan } from '../api';
import { ArrowLeft, Bookmark, Star, Clock, MapPin, DollarSign, Sparkles, MessageSquare, ChevronRight, Check } from 'lucide-react';

interface DetailScreenProps {
  item: ContentItem;
  userId: string;
  isSaved: boolean;
  onBack: () => void;
  onToggleSave: () => void;
  onWriteReview: () => void;
}

export default function DetailScreen({ item, userId, isSaved, onBack, onToggleSave, onWriteReview }: DetailScreenProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [item.id]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const revs = await getReviews(item.id);
      setReviews(revs);
    } catch (e) {
      console.warn("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const stats = item.details?.stats ? Object.entries(item.details.stats) : [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Back button & Action Row */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={onToggleSave}
          className={`p-3 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
            isSaved
              ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
              : 'border-white/10 hover:border-white/25 text-gray-300'
          }`}
          title={isSaved ? "Saved to your destiny timeline" : "Save recommendation"}
        >
          <Bookmark size={18} className={isSaved ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Hero Cover Card */}
      <div className="relative h-[280px] md:h-[380px] rounded-2xl overflow-hidden border border-white/10 divine-glow">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031427] via-[#031427]/40 to-transparent" />
        
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#d2bbff] border border-white/15">
          {item.matchPercentage}% Dynamic Compatibility
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <span className="text-xs uppercase font-bold tracking-widest text-[#d2bbff] block mb-1">
            {item.subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
            {item.title}
          </h2>
          <p className="text-gray-300 text-xs md:text-sm mt-1 flex items-center gap-1">
            <MapPin size={12} className="text-[#7c3aed]" />
            <span>{item.location || 'London, UK'}</span>
            {item.distance && <span className="opacity-60">• {item.distance}</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Overview & AI Perspective */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Perspective Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#102034]/40 border border-[#7c3aed]/20 relative overflow-hidden divine-glow">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#7c3aed]/5 rounded-full blur-[40px] pointer-events-none" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#d2bbff] flex items-center gap-1.5 mb-4">
              <Sparkles size={14} className="animate-pulse" />
              <span>Divine AI Perspective</span>
            </h3>
            <p className="text-white text-base leading-relaxed tracking-wide font-light">
              {item.details?.aiPerspective || item.description}
            </p>
          </div>

          {/* Timing and Pricing callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.details?.bestTime && (
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#7c3aed]/10 text-[#d2bbff] border border-[#7c3aed]/20">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Best Timing</h4>
                  <p className="text-white text-sm font-medium mt-1">{item.details.bestTime}</p>
                </div>
              </div>
            )}

            {item.details?.priceGuide && (
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#7c3aed]/10 text-[#d2bbff] border border-[#7c3aed]/20">
                  <DollarSign size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Price / Expenses Guide</h4>
                  <p className="text-white text-sm font-medium mt-1">{item.details.priceGuide}</p>
                </div>
              </div>
            )}
          </div>

          {/* Vital Stats Grid */}
          {stats.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Vital Statistics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map(([key, value]) => (
                  <div key={key} className="p-4 bg-black/20 border border-white/5 rounded-xl text-center">
                    <span className="text-[10px] uppercase text-gray-400 block tracking-wider">{key}</span>
                    <span className="text-white font-mono font-bold text-sm mt-1 block">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Courses (Colleges Only) */}
          {item.category === 'college' && item.details?.courses && item.details.courses.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Offered Trajectories</h4>
              <div className="space-y-3">
                {item.details.courses.map((course, idx) => (
                  <div key={idx} className="p-4 bg-[#102034]/20 border border-white/5 rounded-xl flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-white text-sm">{course.name}</h5>
                      <span className="text-xs text-gray-400 font-medium">Duration: {course.duration}</span>
                    </div>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-white rounded font-mono text-xs">
                      {course.intake}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Synergistic Pairings & Reviews */}
        <div className="space-y-6">
          {/* Synergistic Pairings */}
          <div className="p-6 bg-[#102034]/20 border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d2bbff] flex items-center gap-1">
              <Sparkles size={12} />
              <span>Synergistic Pairings</span>
            </h4>
            <p className="text-xs text-gray-400">AI predicts these micro-activities will amplify your mental serenity by 14% if paired with your active plan.</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-black/20 border border-white/5 rounded-xl hover:border-white/15 transition-all cursor-pointer">
                <div>
                  <h5 className="font-bold text-white text-xs">Neo-Flora Kitchen</h5>
                  <span className="text-[9px] text-gray-400 font-mono">Gastronomy Match</span>
                </div>
                <span className="text-emerald-400 font-mono text-xs font-bold">98% Match</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-black/20 border border-white/5 rounded-xl hover:border-white/15 transition-all cursor-pointer">
                <div>
                  <h5 className="font-bold text-white text-xs">The Obsidian Loft</h5>
                  <span className="text-[9px] text-gray-400 font-mono">Atmospheric Lounge</span>
                </div>
                <span className="text-emerald-400 font-mono text-xs font-bold">94% Match</span>
              </div>
            </div>
          </div>

          {/* Community Reviews Card List */}
          <div className="p-6 bg-[#102034]/20 border border-white/5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <MessageSquare size={12} />
                <span>Community Voices</span>
              </h4>
              <button
                onClick={onWriteReview}
                className="text-[#d2bbff] text-[10px] uppercase tracking-wider font-bold hover:underline"
              >
                Write Review
              </button>
            </div>

            {loadingReviews ? (
              <div className="py-8 text-center text-xs animate-pulse text-gray-500">
                Aligning commentary...
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-white/5 rounded-xl text-xs text-gray-500">
                No active narrative feeds. Be the first to share!
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-black/20 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={rev.userAvatar} alt={rev.userName} className="w-6 h-6 rounded-full border border-white/10" />
                        <span className="font-bold text-white text-xs">{rev.userName}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        <Star size={10} className="fill-current" />
                        <span className="text-[10px] font-bold ml-0.5">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed font-light italic">
                      "{rev.text}"
                    </p>
                    {rev.images && rev.images.length > 0 && (
                      <div className="w-full h-20 rounded overflow-hidden mt-1.5 border border-white/5">
                        <img src={rev.images[0]} alt="Review proof" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="block text-[8px] text-gray-500 text-right font-mono">{rev.timestamp}</span>
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
