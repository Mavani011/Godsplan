import React, { useState, useRef, DragEvent } from 'react';
import { ContentItem, Review } from '../types';
import { addReview } from '../api';
import { Star, Upload, FileText, Check, AlertCircle, Smile, HelpCircle } from 'lucide-react';

interface ShareScreenProps {
  user: any;
  items: ContentItem[];
  preselectedItem?: ContentItem;
  onReviewSubmitted: () => void;
}

export default function ShareScreen({ user, items, preselectedItem, onReviewSubmitted }: ShareScreenProps) {
  const [selectedItem, setSelectedItem] = useState<string>(preselectedItem?.id || items[0]?.id || '');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Sentiment Analysis
  const getSentiment = () => {
    const lowercase = text.toLowerCase();
    const positiveWords = ['divine', 'exquisite', 'mind-blowing', 'spectacular', 'amazing', 'perfect', 'gorgeous', 'excellent', 'love', 'outstanding', 'best', 'incredible', 'great'];
    const negativeWords = ['disappointing', 'bad', 'poor', 'slow', 'loud', 'crowded', 'average', 'expensive', 'fail', 'regret'];
    
    let posCount = 0;
    let negCount = 0;
    
    positiveWords.forEach(w => { if (lowercase.includes(w)) posCount++; });
    negativeWords.forEach(w => { if (lowercase.includes(w)) negCount++; });

    if (posCount > negCount) {
      return { label: 'Highly Aligned / Divine', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', intensity: 85 + posCount * 5 };
    } else if (negCount > posCount) {
      return { label: 'Friction Detected', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5', intensity: 40 - negCount * 10 };
    } else {
      return { label: 'Balanced Trajectory', color: 'text-[#d2bbff] border-[#7c3aed]/20 bg-[#7c3aed]/5', intensity: 75 };
    }
  };

  const sentiment = getSentiment();

  // Drag & Drop Handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Simulate file upload by setting a nice unsplash preview based on file name or simple default
      const randomImages = [
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop"
      ];
      setImageUrl(randomImages[Math.floor(Math.random() * randomImages.length)]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = () => {
    if (fileInputRef.current?.files && fileInputRef.current.files[0]) {
      // Simulate preview
      setImageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) {
      setError("Please describe your divine narrative.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const newReview: Review = {
      id: "rev_" + Math.random().toString(36).substring(2, 9),
      itemId: selectedItem,
      userName: user.displayName || 'Pioneer User',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRxpbpZrixW59o9vLIb0hbwR87KZ5R1pzMbggoLQlyouEMfrlkPfws151k5Hin-dG-N0dQ2dYw5mcuemcGzFQ-aloaI9-J7InbbNfP1VhmQfnrtTb8JqjpGYrGDQBbw5ulY_PG_nUGJrERgoyhpNcvoKu8ek2s6EBt-P-zrj5W9hg6qwVnOpN-Xgspum3we9yHJvrX5PSBabcqfDogf5LzJnVfEx4LPW36nwN26t9IroVIxAY8970',
      rating,
      text,
      images: imageUrl ? [imageUrl] : [],
      timestamp: "Just now",
      helpfulCount: 0
    };

    try {
      await addReview(newReview);
      setSuccess("Your voice is registered in the divine archive!");
      setText('');
      setImageUrl('');
      setTimeout(() => {
        onReviewSubmitted();
      }, 1500);
    } catch (e) {
      setError("An error occurred publishing your experience.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight font-title-lg">
          Share the Vision
        </h2>
        <p className="text-[#ccc3d8] text-sm mt-1">
          Document your experience on the grid. Help synchronize other pioneers' neural models.
        </p>
      </div>

      <div className="bg-[#102034]/40 border border-white/10 rounded-2xl p-6 md:p-8 divine-glow text-[#d3e4fe]">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-sm flex items-center gap-2">
            <Check size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmitReview} className="space-y-6">
          
          {/* Item Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
              Select Curated Recommendation
            </label>
            <select
              className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm cursor-pointer"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.category.toUpperCase()}] {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* Star Rating Experience */}
          <div className="text-center">
            <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-3">
              Overall EXPERIENCE Rating
            </label>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={32}
                    className={`${
                      rating >= star
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
              Visual Proof (File Attachment)
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive
                  ? 'border-[#7c3aed] bg-[#7c3aed]/5'
                  : imageUrl
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileInputChange}
              />
              
              {imageUrl ? (
                <div className="space-y-3">
                  <div className="w-24 h-24 rounded-lg overflow-hidden mx-auto border border-white/10">
                    <img src={imageUrl} alt="Proof" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <Check size={14} />
                    <span>Visual Attachment Configured</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Remove Proof
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-gray-400">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs text-[#ccc3d8]">
                    Drag and drop your capture, or{' '}
                    <button
                      type="button"
                      onClick={onButtonClick}
                      className="text-[#d2bbff] font-bold hover:underline cursor-pointer"
                    >
                      browse local drive
                    </button>
                  </p>
                  <p className="text-[10px] text-gray-500">Supports PNG, JPG (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Narrative Text */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider">
              The Narrative (Write Review)
            </label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] text-white outline-none transition-all text-sm resize-none"
              placeholder="The dining was sublime, AI predictive alignment accurately suggested duck breast with lavender reduction..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* On-the-fly Sentiment Analysis Widget */}
          {text.trim().length > 0 && (
            <div className={`p-4 border rounded-xl flex items-center justify-between transition-all ${sentiment.color}`}>
              <div className="flex items-center gap-3">
                <Smile size={18} />
                <div>
                  <span className="text-[10px] uppercase font-bold block opacity-60">Real-Time Sentiment</span>
                  <span className="text-xs font-bold">{sentiment.label}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold block opacity-60">Synthesized Intensity</span>
                <span className="text-xs font-mono font-bold">{sentiment.intensity}%</span>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer"
          >
            {loading ? (
              <span className="animate-pulse">Archiving Experience...</span>
            ) : (
              <>
                <span>Publish Experience</span>
                <Check size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
