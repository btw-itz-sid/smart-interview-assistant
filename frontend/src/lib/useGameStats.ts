import { useEffect, useState } from 'react';
import { api } from '../services/api';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  lastActiveDate: string | null;
  xpProgress: { current: number; next: number; progress: number };
}

const TTL_MS = 60_000;

// Layout remounts on every navigation, so keep the last result at module level
// to avoid hitting the rate-limited API on each page change.
let cached: { data: StreakData; at: number } | null = null;
let inflight: Promise<StreakData | null> | null = null;
const listeners = new Set<(d: StreakData) => void>();

const load = (): Promise<StreakData | null> => {
  if (inflight) return inflight;
  inflight = api
    .get('/progress/streak')
    .then((res) => {
      const data = res.data?.data as StreakData;
      cached = { data, at: Date.now() };
      listeners.forEach((fn) => fn(data));
      return data;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
};

export const getCachedGameStats = () => cached?.data ?? null;

/** Refetch now and push the result to every mounted reader (e.g. the top bar after an answer). */
export const refreshGameStats = () => {
  cached = null;
  return load();
};

/** Seed the cache with data a page already fetched. */
export const primeGameStats = (data: StreakData) => {
  cached = { data, at: Date.now() };
  listeners.forEach((fn) => fn(data));
};

export function useGameStats() {
  const [stats, setStats] = useState<StreakData | null>(cached?.data ?? null);

  useEffect(() => {
    listeners.add(setStats);
    if (!cached || Date.now() - cached.at > TTL_MS) load();
    return () => {
      listeners.delete(setStats);
    };
  }, []);

  return stats;
}
