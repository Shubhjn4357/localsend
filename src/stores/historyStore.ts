import { create } from 'zustand';
import type { HistoryItem, HistoryFilter } from '../types/history';
import { LocalStorage, STORAGE_KEYS } from '../utils/storage';

interface HistoryStore {
    history: HistoryItem[];
    isLoading: boolean;

    // Actions
    addHistoryItem: (item: HistoryItem) => Promise<void>;
    updateHistoryItem: (id: string, updates: Partial<HistoryItem>) => Promise<void>;
    removeHistoryItem: (id: string) => Promise<void>;
    clearHistory: () => Promise<void>;
    loadHistory: () => Promise<void>;
    getFilteredHistory: (filter: HistoryFilter) => HistoryItem[];
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
    history: [],
    isLoading: false,

    addHistoryItem: async (item) => {
        const newHistory = [item, ...get().history];
        set({ history: newHistory });
        await LocalStorage.set(STORAGE_KEYS.HISTORY, newHistory);
    },

    updateHistoryItem: async (id, updates) => {
        const newHistory = get().history.map((item) =>
            item.id === id ? { ...item, ...updates } : item
        );
        set({ history: newHistory });
        await LocalStorage.set(STORAGE_KEYS.HISTORY, newHistory);
    },

    removeHistoryItem: async (id) => {
        const newHistory = get().history.filter((item) => item.id !== id);
        set({ history: newHistory });
        await LocalStorage.set(STORAGE_KEYS.HISTORY, newHistory);
    },

    clearHistory: async () => {
        set({ history: [] });
        await LocalStorage.remove(STORAGE_KEYS.HISTORY);
    },

    loadHistory: async () => {
        set({ isLoading: true });
        const history = await LocalStorage.get<HistoryItem[]>(STORAGE_KEYS.HISTORY);
        set({ history: history || [], isLoading: false });
    },

    getFilteredHistory: (filter) => {
        let filtered = get().history;

        if (filter.direction) {
            filtered = filtered.filter((item) => item.direction === filter.direction);
        }
        if (filter.status) {
            filtered = filtered.filter((item) => item.status === filter.status);
        }
        if (filter.deviceId) {
            filtered = filtered.filter((item) => item.deviceId === filter.deviceId);
        }
        if (filter.startDate) {
            filtered = filtered.filter((item) => item.timestamp >= filter.startDate!);
        }
        if (filter.endDate) {
            filtered = filtered.filter((item) => item.timestamp <= filter.endDate!);
        }

        return filtered;
    },
}));
