import { create } from 'zustand';
import type { Device } from '../types/device';

interface DeviceStore {
    devices: Device[];
    isScanning: boolean;
    selectedDevice: Device | null;

    // Actions
    addDevice: (device: Device) => void;
    updateDevice: (fingerprint: string, updates: Partial<Device>) => void;
    removeDevice: (fingerprint: string) => void;
    setSelectedDevice: (device: Device | null) => void;
    clearDevices: () => void;
    setScanning: (isScanning: boolean) => void;
    markDeviceOffline: (fingerprint: string) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
    devices: [],
    isScanning: false,
    selectedDevice: null,

    addDevice: (device) =>
        set((state) => {
            const existingIndex = state.devices.findIndex(
                (d) => d.fingerprint === device.fingerprint
            );

            if (existingIndex >= 0) {
                const updated = [...state.devices];
                updated[existingIndex] = { ...device, isOnline: true };
                return { devices: updated };
            }

            return { devices: [...state.devices, { ...device, isOnline: true }] };
        }),

    updateDevice: (fingerprint, updates) =>
        set((state) => ({
            devices: state.devices.map((d) =>
                d.fingerprint === fingerprint ? { ...d, ...updates } : d
            ),
        })),

    removeDevice: (fingerprint) =>
        set((state) => ({
            devices: state.devices.filter((d) => d.fingerprint !== fingerprint),
        })),

    setSelectedDevice: (device) => set({ selectedDevice: device }),

    clearDevices: () => set({ devices: [], selectedDevice: null }),

    setScanning: (isScanning) => set({ isScanning }),

    markDeviceOffline: (fingerprint) =>
        set((state) => ({
            devices: state.devices.map((d) =>
                d.fingerprint === fingerprint ? { ...d, isOnline: false } : d
            ),
        })),
}));
