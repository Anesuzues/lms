import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SHEET_TABS } from '@/services/adminService';

interface Stats {
  enrolled: number;
  completed: number;
}

async function countSheetStudents(): Promise<number> {
  const sheetId = import.meta.env.VITE_STUDENTS_SHEET_ID as string;
  if (!sheetId) return 0;
  const emails = new Set<string>();
  await Promise.all(
    Object.values(SHEET_TABS).map(async tabName => {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const lines = (await res.text()).trim().split('\n');
        if (lines.length < 2) return;
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
        const emailIdx = headers.findIndex(h => h.includes('email'));
        if (emailIdx < 0) return;
        for (const line of lines.slice(1)) {
          const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
          const email = cols[emailIdx]?.toLowerCase();
          if (email) emails.add(email);
        }
      } catch { /* ignore failed tabs */ }
    })
  );
  return emails.size;
}

async function fetchCounts(): Promise<Stats> {
  const [rpcResult, sheetCount] = await Promise.all([
    supabase.rpc('get_live_stats'),
    countSheetStudents(),
  ]);

  const dbEnrolled  = rpcResult.data?.enrolled  ?? 0;
  const dbCompleted = rpcResult.data?.completed ?? 0;

  // Sheet students completed before digital certs existed — count them in both stats
  return { enrolled: dbEnrolled + sheetCount, completed: dbCompleted + sheetCount };
}

const LiveStats = () => {
  const [stats, setStats] = useState<Stats>({ enrolled: 0, completed: 0 });

  useEffect(() => {
    fetchCounts().then(setStats);

    const channel = supabase
      .channel('live-student-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enrollments' },
        () => fetchCounts().then(setStats),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const items = [
    { value: stats.enrolled,  label: 'Students Enrolled' },
    { value: stats.completed, label: 'Certificates Completed' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map(s => (
        <div
          key={s.label}
          className="bg-card/30 backdrop-blur-sm border border-primary/20 rounded-xl p-5"
        >
          <div className="font-orbitron font-black text-3xl text-primary mb-1 tabular-nums">
            {s.value > 0 ? s.value.toLocaleString() : '-'}
          </div>
          <div className="font-exo text-xs text-muted-foreground uppercase tracking-wide">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveStats;
