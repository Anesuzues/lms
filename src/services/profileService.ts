import { supabase } from '@/lib/supabase';

export interface UserStats {
  streak: number;
  xp: number;
  onboarded: boolean;
}

export interface LevelInfo {
  level: number;
  name: string;
  min: number;
  next: number;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Newcomer',  min: 0,    next: 100  },
  { level: 2, name: 'Explorer',  min: 100,  next: 300  },
  { level: 3, name: 'Learner',   min: 300,  next: 700  },
  { level: 4, name: 'Achiever',  min: 700,  next: 1500 },
  { level: 5, name: 'Pro',       min: 1500, next: 3000 },
  { level: 6, name: 'Expert',    min: 3000, next: 6000 },
  { level: 7, name: 'Graduate',  min: 6000, next: 9999 },
];

export function getLevelFromXP(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.min) current = l;
    else break;
  }
  return current;
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  const { data } = await supabase
    .from('profiles')
    .select('streak, xp, onboarded, created_at')
    .eq('id', userId)
    .single();

  // Treat users created before the gamification feature (2026-06-05) as already onboarded
  // so the welcome modal doesn't fire for existing accounts
  const isExistingUser = data?.created_at
    ? new Date(data.created_at) < new Date('2026-06-05T00:00:00Z')
    : false;

  return {
    streak: data?.streak ?? 0,
    xp: data?.xp ?? 0,
    onboarded: (data?.onboarded ?? false) || isExistingUser,
  };
}

export interface StreakXPResult {
  streak: number;
  xp: number;
  leveledUp: boolean;
  newLevelName?: string;
  streakBonus: boolean;
}

export async function updateStreakAndXP(userId: string, xpGain: number): Promise<StreakXPResult> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak, last_active_date, xp')
    .eq('id', userId)
    .single();

  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
  const lastDate  = profile?.last_active_date ?? null;

  let newStreak = profile?.streak ?? 0;
  if (lastDate === today) {
    // Already logged today — don't change streak
  } else if (lastDate === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  const streakBonus  = newStreak > 0 && newStreak % 7 === 0;
  const bonusXP      = streakBonus ? 100 : 0;
  const oldXP        = profile?.xp ?? 0;
  const newXP        = oldXP + xpGain + bonusXP;
  const oldLevel     = getLevelFromXP(oldXP);
  const newLevel     = getLevelFromXP(newXP);
  const leveledUp    = newLevel.level > oldLevel.level;

  await supabase.from('profiles').update({
    streak: newStreak,
    last_active_date: today,
    xp: newXP,
  }).eq('id', userId);

  return {
    streak: newStreak,
    xp: newXP,
    leveledUp,
    newLevelName: leveledUp ? newLevel.name : undefined,
    streakBonus,
  };
}

export async function markOnboarded(userId: string): Promise<void> {
  await supabase.from('profiles').update({ onboarded: true }).eq('id', userId);
}
