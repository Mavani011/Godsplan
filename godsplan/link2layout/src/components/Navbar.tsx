import React from 'react';
import { Home, Compass, GraduationCap, Bell, User, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

export default function Navbar({ activeTab, onTabChange, unreadCount = 1 }: NavbarProps) {
  const tabs = [
    { id: 'home', label: 'AI Home', icon: Home },
    { id: 'discovery', label: 'Discovery', icon: Compass },
    { id: 'colleges', label: 'Colleges', icon: GraduationCap },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <>
      {/* Desktop left-side navigation rail (md:flex, hidden on mobile) */}
      <nav className="hidden md:flex fixed top-0 left-0 h-full w-24 border-r border-white/10 flex-col items-center justify-between py-10 z-20 bg-[#000d1a]">
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => onTabChange('home')}>
          <div className="w-10 h-10 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-white group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(124,58,237,0.2)]">
            <Sparkles size={18} className="text-[#d2bbff] animate-spin-slow" />
          </div>
          <span className="text-[10px] font-black italic tracking-tighter text-[#d2bbff]">G.</span>
        </div>

        {/* Tab Icons list */}
        <div className="flex flex-col gap-8 w-full px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative w-full py-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer ${
                  isActive 
                    ? 'text-[#d2bbff] bg-white/[0.03] border-l-2 border-[#7c3aed]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
                }`}
              >
                <Icon size={20} className="group-hover:scale-105 transition-all" />
                <span className="text-[9px] uppercase tracking-wider font-bold">
                  {tab.id === 'colleges' ? 'Colleges' : tab.id === 'discovery' ? 'Discover' : tab.id}
                </span>

                {/* Optional notification badge */}
                {tab.badge ? (
                  <span className="absolute top-1.5 right-4 w-1.5 h-1.5 bg-red-500 rounded-full" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Decorative dynamic indicator dot */}
        <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
      </nav>

      {/* Mobile/Tablet bottom floating nav bar (fixed bottom, hidden on desktop) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-[#031427]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around px-4 z-40 shadow-[0_8px_32px_rgba(0,0,0,0.5)] divine-glow">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-[#d2bbff]' : 'text-gray-400'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-bold uppercase mt-1 tracking-wider">
                {tab.id === 'colleges' ? 'Colleges' : tab.id === 'discovery' ? 'Explore' : tab.id}
              </span>
              
              {tab.badge ? (
                <span className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              ) : null}
            </button>
          );
        })}
      </nav>
    </>
  );
}
