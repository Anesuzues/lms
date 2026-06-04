import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Stats {
  enrolled: number;
  completed: number;
}

async function fetchCounts(): Promise<Stats> {
  const [enrolledRes, completedRes] = await Promise.all([
    supabase.from('enrollments').select('user_id'),
    supabase.from('enrollments').select('user_id').gte('progress', 100),
  ]);
  const enrolled  = new Set((enrolledRes.data  ?? []).map(e => e.user_id)).size;
  const completed = new Set((completedRes.data ?? []).map(e => e.user_id)).size;
  return { enrolled, completed };
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
            {s.value > 0 ? s.value.toLocaleString() : '—'}
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
