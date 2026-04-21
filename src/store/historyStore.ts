import { create } from 'zustand';

interface HistoryState {
  past: unknown[];
  future: unknown[];
}

interface HistoryActions {
  pushState: (state: unknown) => void;
  undo: (currentState: unknown) => unknown | null;
  redo: (currentState: unknown) => unknown | null;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState & HistoryActions>((set, get) => ({
  past: [],
  future: [],

  pushState: (state) => {
    set((s) => ({
      past: [...s.past.slice(-MAX_HISTORY + 1), state],
      future: [],
    }));
  },

  undo: (currentState) => {
    const { past } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [currentState, ...get().future],
    });
    return previous;
  },

  redo: (currentState) => {
    const { future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    set({
      past: [...get().past, currentState],
      future: future.slice(1),
    });
    return next;
  },

  clear: () => set({ past: [], future: [] }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));