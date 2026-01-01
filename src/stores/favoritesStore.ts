import { create } from 'zustand';
import type { Device } from '../types/device';
import { LocalStorage, STORAGE_KEYS } from '../utils/storage';

interface FavoritesStore {
    favorites: string[]; // Array of device fingerprints
    isLoading: boolean;

    // Actions
    addFavorite: (fingerprint: string) => Promise<void>;
    removeFavorite: (fingerprint: string) => Promise<void>;
    toggleFavorite: (fingerprint: string) => Promise<void>;
    isFavorite: (fingerprint: string) => boolean;
    loadFavorites: () => Promise<void>;
    getFavoriteDevices: (allDevices: Device[]) => Device[];
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
    favorites: [],
    isLoading: false,

    addFavorite: async (fingerprint) => {
        if (get().favorites.includes(fingerprint)) return;
        const newFavorites = [...get().favorites, fingerprint];
        set({ favorites: newFavorites });
        await LocalStorage.set(STORAGE_KEYS.FAVORITES, newFavorites);
    },

    removeFavorite: async (fingerprint) => {
        const newFavorites = get().favorites.filter((f) => f !== fingerprint);
        set({ favorites: newFavorites });
        await LocalStorage.set(STORAGE_KEYS.FAVORITES, newFavorites);
    },

    toggleFavorite: async (fingerprint) => {
        if (get().favorites.includes(fingerprint)) {
            await get().removeFavorite(fingerprint);
        } else {
            await get().addFavorite(fingerprint);
        }
    },

    isFavorite: (fingerprint) => {
        return get().favorites.includes(fingerprint);
    },

    loadFavorites: async () => {
        set({ isLoading: true });
        const favorites = await LocalStorage.get<string[]>(STORAGE_KEYS.FAVORITES);
        set({ favorites: favorites || [], isLoading: false });
    },

    getFavoriteDevices: (allDevices) => {
        const favoriteIds = get().favorites;
        return allDevices.filter((device) => favoriteIds.includes(device.fingerprint));
    },
}));
