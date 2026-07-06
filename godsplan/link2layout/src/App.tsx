import React, { useState, useEffect } from 'react';
import { ContentItem, UserProfile } from './types';
import { getItems, getSavedPlans, toggleSavedPlan, getCurrentUserSync } from './api';

import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import CMSPanel from './components/CMSPanel';
import AppHome from './components/AppHome';
import DiscoveryScreen from './components/DiscoveryScreen';
import CollegeScreen from './components/CollegeScreen';
import DetailScreen from './components/DetailScreen';
import ProfileScreen from './components/ProfileScreen';
import AlertsScreen from './components/AlertsScreen';
import ShareScreen from './components/ShareScreen';

import { Sparkles, BrainCircuit, ShieldAlert, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(getCurrentUserSync());
  const [items, setItems] = useState<ContentItem[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  
  // Tabs: 'home' | 'discovery' | 'colleges' | 'alerts' | 'profile' | 'share'
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isCMSOpen, setIsCMSOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we have a user on mount or change, sync data
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const activeItems = await getItems();
      setItems(activeItems);
      
      const savedIds = await getSavedPlans(user!.uid);
      setSavedItemIds(savedIds);
    } catch (e) {
      console.warn("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (itemId: string) => {
    if (!user) return;
    try {
      const isNowSaved = await toggleSavedPlan(user.uid, itemId);
      if (isNowSaved) {
        setSavedItemIds([...savedItemIds, itemId]);
      } else {
        setSavedItemIds(savedItemIds.filter(id => id !== itemId));
      }
    } catch (e) {
      console.warn("Error toggling bookmark plan");
    }
  };

  // Callback to refresh data after CMS edits
  const handleRefreshCMS = async () => {
    const activeItems = await getItems();
    setItems(activeItems);
    
    // Refresh selected item details if open
    if (selectedItem) {
      const updated = activeItems.find(it => it.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  };

  // If user is not authenticated, render login/signup
  if (!user) {
    return <AuthScreen onAuthSuccess={(profile) => setUser(profile)} />;
  }

  return (
    <div className="min-h-screen bg-[#031427] text-[#d3e4fe] relative">
      {/* Glow decorative vectors */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-[#7c3aed]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-[#d2bbff]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Left/Bottom Responsive Navigation */}
      <Navbar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedItem(null); // Clear item detail view when tab shifts
        setIsCMSOpen(false);   // Close CMS Console
      }} />

      {/* Viewport content area */}
      <div className="md:ml-24 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto p-4 md:p-8 md:pt-12">
          
          {/* Header Bar */}
          <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Universe Status:
              </span>
              <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE ALIGNMENT
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCMSOpen(!isCMSOpen)}
                className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCMSOpen
                    ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                    : 'border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <BrainCircuit size={12} />
                <span>CMS Console</span>
              </button>
            </div>
          </header>

          {/* CMS Modal Panel Overlay */}
          {isCMSOpen ? (
            <div className="animate-fade-in">
              <CMSPanel 
                onClose={() => setIsCMSOpen(false)} 
                onRefreshData={handleRefreshCMS} 
              />
            </div>
          ) : (
            /* Main Tab Views routing */
            <main>
              {selectedItem ? (
                /* Item Detail Page */
                <DetailScreen
                  item={selectedItem}
                  userId={user.uid}
                  isSaved={savedItemIds.includes(selectedItem.id)}
                  onBack={() => setSelectedItem(null)}
                  onToggleSave={() => handleToggleSave(selectedItem.id)}
                  onWriteReview={() => {
                    setActiveTab('share');
                    setSelectedItem(null);
                  }}
                />
              ) : (
                /* Tab routing layout */
                <div className="animate-fade-in">
                  {activeTab === 'home' && (
                    <AppHome
                      user={user}
                      items={items}
                      savedItemIds={savedItemIds}
                      onSelectItem={(item) => setSelectedItem(item)}
                      onNavigateToTab={(tab) => setActiveTab(tab)}
                    />
                  )}

                  {activeTab === 'discovery' && (
                    <DiscoveryScreen
                      items={items}
                      onSelectItem={(item) => setSelectedItem(item)}
                    />
                  )}

                  {activeTab === 'colleges' && (
                    <CollegeScreen
                      items={items}
                      onSelectItem={(item) => setSelectedItem(item)}
                    />
                  )}

                  {activeTab === 'alerts' && (
                    <AlertsScreen />
                  )}

                  {activeTab === 'profile' && (
                    <ProfileScreen
                      user={user}
                      items={items}
                      savedItemIds={savedItemIds}
                      onSelectItem={(item) => setSelectedItem(item)}
                      onLogout={() => setUser(null)}
                      onOpenCMS={() => setIsCMSOpen(true)}
                    />
                  )}

                  {activeTab === 'share' && (
                    <ShareScreen
                      user={user}
                      items={items}
                      preselectedItem={undefined}
                      onReviewSubmitted={() => setActiveTab('home')}
                    />
                  )}
                </div>
              )}
            </main>
          )}

        </div>
      </div>
    </div>
  );
}
