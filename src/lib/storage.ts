import { STORAGE_KEY } from "@/data/config";
import { createInitialProgress, normalizeProgress, ProgressState } from "@/lib/progress";

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return createInitialProgress();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(progress: ProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgressStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
