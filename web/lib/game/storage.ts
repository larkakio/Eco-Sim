export const STORAGE_KEY = "eco-sim-max-level-v1";

export function loadMaxUnlocked(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 1;
    return Number.isFinite(n) && n >= 1 ? n : 1;
  } catch {
    return 1;
  }
}

export function saveMaxUnlocked(maxLevel: number): void {
  if (typeof window === "undefined") return;
  try {
    const prev = loadMaxUnlocked();
    const next = Math.max(prev, maxLevel);
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    /* ignore */
  }
}

export function unlockAfterComplete(completedLevelId: number): number {
  const nextUnlocked = completedLevelId + 1;
  saveMaxUnlocked(nextUnlocked);
  return nextUnlocked;
}
