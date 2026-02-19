export const STORAGE_KEY = "task-board-state";
export const STORAGE_VERSION = 2;

/**
 * Loads persisted state from localStorage and migrates it when needed.
 * @returns {import("../store/useTaskStore").TaskStoreState | null}
 */
export function loadPersistedState() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const version = Number(parsed?.version ?? 1);
    const state = parsed?.state;

    if (!state || typeof state !== "object") return null;

    if (version < 2) {
      return {
        ...state,
        ui: {
          sidebarOpen: true,
          searchQuery: state?.ui?.searchQuery ?? "",
        },
      };
    }

    return state;
  } catch {
    return null;
  }
}

/**
 * Persists the task store subset to localStorage.
 * @param {import("../store/useTaskStore").TaskStoreState} state
 */
export function savePersistedState(state) {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      version: STORAGE_VERSION,
      state,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // No-op for quota/private mode errors.
  }
}