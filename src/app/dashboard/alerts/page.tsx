'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AlertHistory from '@/components/dashboard/alerts/AlertHistory';
import NotificationPrefs from '@/components/dashboard/alerts/NotificationPrefs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { AlertHistoryItem, UserPreferences } from '@/lib/types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertHistoryItem[]>([]);
  const [prefs, setPrefs] = useState<Partial<UserPreferences>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [alertsRes, prefsRes] = await Promise.all([
        supabase
          .from('alert_history')
          .select('*')
          .eq('user_id', user.id)
          .order('sent_at', { ascending: false })
          .limit(50),
        fetch('/api/preferences'),
      ]);

      setAlerts(alertsRes.data ?? []);
      const prefsData = await prefsRes.json();
      setPrefs(prefsData);
      setLoading(false);
    }
    load();
  }, []);

  const handlePrefsUpdate = async (updates: Partial<UserPreferences>) => {
    const res = await fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setPrefs(data);
    }
    return res.ok;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Alerts</h1>
        <p className="text-sm text-gray-400 mt-1">
          Notification history and preferences
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 text-sm animate-pulse">Loading alerts…</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AlertHistory alerts={alerts} />
          </div>
          <div>
            <NotificationPrefs prefs={prefs} onUpdate={handlePrefsUpdate} />
          </div>
        </div>
      )}
    </div>
  );
}
