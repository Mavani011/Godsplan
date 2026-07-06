import React, { useState, useEffect } from 'react';
import { ContentItem } from '../types';
import { getItems, saveItem, deleteItem } from '../api';
import { Plus, Edit2, Trash2, Save, X, Sparkles, Image as ImageIcon, MapPin, GraduationCap, Utensils, Compass, BrainCircuit } from 'lucide-react';

interface CMSPanelProps {
  onClose?: () => void;
  onRefreshData?: () => void;
}

export default function CMSPanel({ onClose, onRefreshData }: CMSPanelProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isEditing, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected item state for the editor
  const [id, setId] = useState('');
  const [category, setCategory] = useState<'food' | 'college' | 'travel' | 'tech' | 'wellness'>('food');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [matchPercentage, setMatchPercentage] = useState(95);
  const [rating, setRating] = useState(4.8);
  const [distance, setDistance] = useState('');
  const [location, setLocation] = useState('');
  const [rank, setRank] = useState('');
  const [image, setImage] = useState('');
  
  // Details
  const [aiPerspective, setAiPerspective] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [priceGuide, setPriceGuide] = useState('');
  
  // Custom courses or stats
  const [course1Name, setCourse1Name] = useState('');
  const [course1Duration, setCourse1Duration] = useState('');
  const [course1Intake, setCourse1Intake] = useState('');
  const [course2Name, setCourse2Name] = useState('');
  const [course2Duration, setCourse2Duration] = useState('');
  const [course2Intake, setCourse2Intake] = useState('');

  const [stat1Key, setStat1Key] = useState('Atmospheric Pressure');
  const [stat1Value, setStat1Value] = useState('1013 hPa');
  const [stat2Key, setStat2Key] = useState('Crowd Density');
  const [stat2Value, setStat2Value] = useState('Low (12%)');

  useEffect(() => {
    loadAllItems();
  }, []);

  const loadAllItems = async () => {
    setLoading(true);
    try {
      const allItems = await getItems();
      setItems(allItems);
    } catch (err) {
      setError("Failed to load content items.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setId("item_" + Math.random().toString(36).substring(2, 9));
    setCategory('food');
    setTitle('');
    setSubtitle('');
    setDescription('');
    setMatchPercentage(95);
    setRating(4.8);
    setDistance('');
    setLocation('');
    setRank('');
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop');
    setAiPerspective('');
    setBestTime('');
    setPriceGuide('');
    setCourse1Name('');
    setCourse1Duration('');
    setCourse1Intake('');
    setCourse2Name('');
    setCourse2Duration('');
    setCourse2Intake('');
    setStat1Key('Atmospheric Pressure');
    setStat1Value('1013 hPa');
    setStat2Key('Crowd Density');
    setStat2Value('Low (12%)');
    
    setIsEditMode(true);
    setError('');
    setSuccess('');
  };

  const handleEditClick = (item: ContentItem) => {
    setId(item.id);
    setCategory(item.category);
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setDescription(item.description);
    setMatchPercentage(item.matchPercentage || 90);
    setRating(item.rating || 4.5);
    setDistance(item.distance || '');
    setLocation(item.location || '');
    setRank(item.rank || '');
    setImage(item.image || '');
    setAiPerspective(item.details?.aiPerspective || '');
    setBestTime(item.details?.bestTime || '');
    setPriceGuide(item.details?.priceGuide || '');
    
    // Preset courses if exist
    const courses = item.details?.courses || [];
    setCourse1Name(courses[0]?.name || '');
    setCourse1Duration(courses[0]?.duration || '');
    setCourse1Intake(courses[0]?.intake || '');
    setCourse2Name(courses[1]?.name || '');
    setCourse2Duration(courses[1]?.duration || '');
    setCourse2Intake(courses[1]?.intake || '');

    // Preset stats if exist
    const statsKeys = Object.keys(item.details?.stats || {});
    setStat1Key(statsKeys[0] || 'Atmospheric Pressure');
    setStat1Value(item.details?.stats?.[statsKeys[0]] || '1013 hPa');
    setStat2Key(statsKeys[1] || 'Crowd Density');
    setStat2Value(item.details?.stats?.[statsKeys[1]] || 'Low (12%)');

    setIsEditMode(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteClick = async (itemId: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this divine recommendation?")) {
      return;
    }
    try {
      await deleteItem(itemId);
      setSuccess("Recommendation dissolved successfully.");
      loadAllItems();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setError("Failed to dissolve recommendation.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !aiPerspective) {
      setError("Please fill in the required fields (Title, Description, and AI Perspective).");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // Prepare nested objects
    const courses = [];
    if (course1Name) courses.push({ name: course1Name, duration: course1Duration, intake: course1Intake });
    if (course2Name) courses.push({ name: course2Name, duration: course2Duration, intake: course2Intake });

    const stats: Record<string, string> = {};
    if (stat1Key && stat1Value) stats[stat1Key] = stat1Value;
    if (stat2Key && stat2Value) stats[stat2Key] = stat2Value;

    const savedItem: ContentItem = {
      id,
      category,
      title,
      subtitle,
      description,
      matchPercentage: Number(matchPercentage),
      rating: Number(rating),
      distance,
      location,
      rank,
      image,
      details: {
        aiPerspective,
        bestTime,
        priceGuide,
        stats,
        ...(category === 'college' ? { courses } : {})
      }
    };

    try {
      await saveItem(savedItem);
      setSuccess("Your alignment is synthesized into the divine collective!");
      setIsEditMode(false);
      loadAllItems();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setError("An error occurred while saving the recommendation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#102034]/90 backdrop-blur-3xl rounded-2xl border border-white/10 p-6 md:p-8 divine-glow text-[#d3e4fe]">
      {/* CMS Header */}
      <div className="flex justify-between items-center pb-4 mb-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#d2bbff] via-[#7c3aed] to-[#d2bbff] flex items-center gap-2">
            <BrainCircuit className="text-[#d2bbff]" />
            <span>Divine CMS Console</span>
          </h2>
          <p className="text-xs text-[#ccc3d8]">Create, edit, or dissolve recommendations for the app screens.</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all">
            <X size={20} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-sm">
          {success}
        </div>
      )}

      {/* Editor Modal / View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Recommendation Title *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm"
                placeholder="Etheria Gastronomy or St. Xavier's"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Divine Category
              </label>
              <select
                className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="food">🍽️ Food & Dining</option>
                <option value="college">🎓 Academic Sanctuary (College)</option>
                <option value="travel">🧭 Hidden Nature / Travel</option>
                <option value="tech">💻 Technological Marvels</option>
                <option value="wellness">🧘 Wellness & Zen Retreats</option>
              </select>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Subtitle / Cuisine Type / Spec
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm"
                placeholder="e.g. French Modern, Japanese Fusion, or AI and Machine Learning"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            {/* Match Percentage */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2 flex justify-between">
                <span>Divine Compatibility (Match %)</span>
                <span className="text-[#d2bbff] font-bold">{matchPercentage}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                className="w-full accent-[#7c3aed]"
                value={matchPercentage}
                onChange={(e) => setMatchPercentage(Number(e.target.value))}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Rating (out of 5)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
            </div>

            {/* Distance */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Distance / Metros / Neighborhood
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm"
                placeholder="0.4 miles, Mumbai, or Soho London"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Full Address / Coordinates
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm"
                placeholder="12 Wardour St, London, UK"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Image URL / Cover Art
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm"
                placeholder="https://unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            {/* Rank / Badge */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Rank Badge / Display Label
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm"
                placeholder="RANK #04, 98% Match, Premium, or Elite Choice"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
              />
            </div>

            {/* Best Time & Price Guide */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Best Timing
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm"
                placeholder="Arrive at 5:45 AM for Blue Hour or 8:00 PM for dinner"
                value={bestTime}
                onChange={(e) => setBestTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Pricing Level / Range
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm"
                placeholder="$$$ Fine Dining or ₹2.4 L - 4.2 L per Annum"
                value={priceGuide}
                onChange={(e) => setPriceGuide(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
              Short Recommendation Summary *
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm resize-none"
              placeholder="Matches your 'Balanced Lifestyle' goal for this week..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* AI Perspective */}
          <div>
            <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles size={12} className="text-[#d2bbff]" />
              <span>Divine AI Perspective * (Detailed Assessment)</span>
            </label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm resize-none"
              placeholder="The Ethereal Atrium offers an exceptional serenity index due to its physical alignment with the surrounding forest..."
              value={aiPerspective}
              onChange={(e) => setAiPerspective(e.target.value)}
            />
          </div>

          {/* College Courses (Conditional) */}
          {category === 'college' && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <GraduationCap size={16} />
                <span>Academic Courses (Max 2 for simple display)</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="B.Tech Computer Science"
                  className="px-3 py-2 bg-[#0b1c30] border border-white/10 rounded-lg text-sm text-white"
                  value={course1Name}
                  onChange={(e) => setCourse1Name(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="4 Years"
                  className="px-3 py-2 bg-[#0b1c30] border border-white/10 rounded-lg text-sm text-white"
                  value={course1Duration}
                  onChange={(e) => setCourse1Duration(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="120 Seats"
                  className="px-3 py-2 bg-[#0b1c30] border border-white/10 rounded-lg text-sm text-white"
                  value={course1Intake}
                  onChange={(e) => setCourse1Intake(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="B.Tech Artificial Intelligence"
                  className="px-3 py-2 bg-[#0b1c30] border border-white/10 rounded-lg text-sm text-white"
                  value={course2Name}
                  onChange={(e) => setCourse2Name(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="4 Years"
                  className="px-3 py-2 bg-[#0b1c30] border border-white/10 rounded-lg text-sm text-white"
                  value={course2Duration}
                  onChange={(e) => setCourse2Duration(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="60 Seats"
                  className="px-3 py-2 bg-[#0b1c30] border border-white/10 rounded-lg text-sm text-white"
                  value={course2Intake}
                  onChange={(e) => setCourse2Intake(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Stats Config */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <span>Vital Statistics / Meta Metrics</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Metric 1 Name (e.g. Crowd Density)"
                  className="flex-1 px-3 py-2 bg-[#0b1c30] border border-white/10 rounded-lg text-sm text-white"
                  value={stat1Key}
                  onChange={(e) => setStat1Key(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Low (12%))"
                  className="flex-1 px-3 py-2 bg-[#0b1c30] border border-white/10 rounded-lg text-sm text-white"
                  value={stat1Value}
                  onChange={(e) => setStat1Value(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Metric 2 Name (e.g. Oxygen level)"
                  className="flex-1 px-3 py-2 bg-[#0b1c30] border border-white/10 rounded-lg text-sm text-white"
                  value={stat2Key}
                  onChange={(e) => setStat2Key(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value"
                  className="flex-1 px-3 py-2 bg-[#0b1c30] border border-white/10 rounded-lg text-sm text-white"
                  value={stat2Value}
                  onChange={(e) => setStat2Value(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Editor Controls */}
          <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="px-6 py-3 border border-white/20 text-[#d3e4fe] font-bold rounded-xl active:scale-95 transition-all text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm flex items-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              <span>{loading ? "Aligning..." : "Publish to Path"}</span>
            </button>
          </div>
        </form>
      ) : (
        /* List View */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">Active Recommendations ({items.length})</h3>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-[#7c3aed] text-white font-bold rounded-xl shadow-md hover:bg-[#7c3aed]/80 active:scale-95 transition-all text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} />
              <span>Manifest New Item</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-[#ccc3d8]">
              Deciphering matching indices...
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-xl">
              <p className="text-gray-400">No items detected on your divine roadmap.</p>
              <button
                onClick={handleCreateNew}
                className="mt-4 px-4 py-2 border border-[#7c3aed] text-[#d2bbff] rounded-xl hover:bg-[#7c3aed]/10 transition-all text-sm cursor-pointer"
              >
                Create First Item
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-[#102034]/60 border border-white/5 rounded-xl hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-[#000f21]">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm line-clamp-1">{item.title}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] uppercase tracking-wider text-gray-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-2 bg-white/5 hover:bg-white/10 text-[#d2bbff] rounded-lg transition-all"
                      title="Edit Item"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="p-2 bg-red-950/20 hover:bg-red-900/40 text-red-400 rounded-lg transition-all"
                      title="Dissolve Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
