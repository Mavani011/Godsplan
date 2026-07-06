import React, { useState } from 'react';
import { signUpUser, signInUser } from '../api';
import { UserProfile } from '../types';
import { Sparkles, Mail, Lock, User, LogIn, ArrowRight, Compass } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !displayName)) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      let userProfile;
      if (isLogin) {
        userProfile = await signInUser(email, password);
      } else {
        userProfile = await signUpUser(email, password, displayName);
      }
      onAuthSuccess(userProfile);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#031427] text-[#d3e4fe] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-[#7c3aed]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-[#d2bbff]/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Floating Sparkles in Background */}
      <div className="absolute top-1/4 left-1/4 text-[#7c3aed]/10 animate-pulse pointer-events-none">
        <Sparkles size={48} />
      </div>
      <div className="absolute bottom-1/4 right-1/4 text-[#d2bbff]/10 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}>
        <Compass size={64} />
      </div>

      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 text-[#d2bbff] mb-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <Sparkles size={32} className="animate-spin-slow" />
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#d2bbff] via-[#7c3aed] to-[#d2bbff] font-title-lg mb-2">
            GodsPlan AI
          </h1>
          <p className="text-[#ccc3d8] text-sm max-w-xs mx-auto">
            A premium personalized discovery and path planning assistant powered by AI.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#102034]/60 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.4)] divine-glow relative">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isLogin ? "Sign In to Your Path" : "Create Your Divine Destiny"}
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] text-white outline-none transition-all placeholder:text-gray-500 text-sm"
                    placeholder="Julian Voss"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] text-white outline-none transition-all placeholder:text-gray-500 text-sm"
                  placeholder="name@destiny.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-[#0b1c30] border border-white/10 rounded-xl focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] text-white outline-none transition-all placeholder:text-gray-500 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest mt-6 cursor-pointer"
            >
              {loading ? (
                <span className="animate-pulse">Analyzing Trajectory...</span>
              ) : (
                <>
                  <span>{isLogin ? "Ascend Path" : "Initialize Destiny"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch Auth Mode Toggle */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm">
            <span className="text-[#ccc3d8]">
              {isLogin ? "New to GodsPlan?" : "Already aligned to a path?"}{" "}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-[#d2bbff] hover:underline font-bold transition-all cursor-pointer"
            >
              {isLogin ? "Sign Up Now" : "Log In Here"}
            </button>
          </div>
        </div>

        {/* Demo Account Tip */}
        <div className="text-center mt-6 text-xs text-[#ccc3d8]/40">
          Tip: Enter any email/password to sign up or log in instantly (LocalStorage sandbox sandbox mode).
        </div>
      </div>
    </div>
  );
}
