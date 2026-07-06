import React, { useState, useEffect } from 'react';
import { AlertNotification } from '../types';
import { getAlerts, deleteAlert } from '../api';
import { Bell, BellOff, Trash2, ShieldCheck, Sparkles, AlertTriangle, Calendar, MessageCircle, X } from 'lucide-react';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState({
    match: true,
    social: true,
    urgent: true
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const activeAlerts = await getAlerts();
      setAlerts(activeAlerts);
    } catch (e) {
      console.warn("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (e) {
      console.warn("Failed to dismiss alert");
    }
  };

  // Filter alerts by active channels
  const filteredAlerts = alerts.filter(a => {
    if (a.type === 'match' && !channels.match) return false;
    if (a.type === 'social' && !channels.social) return false;
    if (a.type === 'urgent' && !channels.urgent) return false;
    return true;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Sparkles className="text-emerald-400" size={18} />;
      case 'social':
        return <MessageCircle className="text-[#d2bbff]" size={18} />;
      case 'urgent':
        return <AlertTriangle className="text-amber-400" size={18} />;
      default:
        return <Bell className="text-gray-400" size={18} />;
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-2xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight font-title-lg">
          Divine Timeline Feed
        </h2>
        <p className="text-[#ccc3d8] text-sm mt-1">
          Stay synchronized with real-time reservation alignments, meetups, and status upgrades.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Toggles sidebar (1 col) */}
        <div className="md:col-span-1 p-5 bg-[#102034]/20 border border-white/5 rounded-2xl h-fit space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#d2bbff] flex items-center gap-1">
            <Bell size={12} />
            <span>Mute Channels</span>
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Match Updates</span>
              <button
                type="button"
                onClick={() => setChannels({ ...channels, match: !channels.match })}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${channels.match ? 'bg-[#7c3aed]' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${channels.match ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Community Aligns</span>
              <button
                type="button"
                onClick={() => setChannels({ ...channels, social: !channels.social })}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${channels.social ? 'bg-[#7c3aed]' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${channels.social ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Urgent System Alerts</span>
              <button
                type="button"
                onClick={() => setChannels({ ...channels, urgent: !channels.urgent })}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${channels.urgent ? 'bg-[#7c3aed]' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${channels.urgent ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Alerts list (2 cols) */}
        <div className="md:col-span-2 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-xs text-gray-500 animate-pulse">
              Syncing universe feeds...
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl text-xs text-gray-500">
              Your celestial timeline is completely tranquil.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="group p-4 bg-[#102034]/40 border border-white/5 hover:border-white/10 rounded-xl transition-all flex items-start gap-4 relative overflow-hidden"
              >
                {/* Border Accent Line for Urgent */}
                {alert.type === 'urgent' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                )}

                <div className="p-2.5 rounded-xl bg-black/20 shrink-0 border border-white/5">
                  {getAlertIcon(alert.type)}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">{alert.title}</h4>
                    <span className="text-[8px] font-mono text-gray-400 shrink-0 ml-auto">{alert.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {alert.description}
                  </p>

                  {/* Actions (Conditional) */}
                  {alert.type === 'urgent' && (
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded font-bold text-[9px] uppercase tracking-wider transition-all">
                        AI Reschedule
                      </button>
                      <button className="px-3 py-1 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded text-[9px] uppercase tracking-wider transition-all">
                        Keep Flight
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(alert.id)}
                  className="absolute right-3 top-3 p-1 rounded-full text-gray-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                  title="Dismiss alert"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
