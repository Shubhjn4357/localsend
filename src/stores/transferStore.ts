import { create } from 'zustand';
import type { Transfer, FileInfo } from '../types/transfer';
import type { Device } from '../types/device';

interface TransferStore {
    transfers: Transfer[];
    selectedFiles: FileInfo[];

    // Actions
    addTransfer: (transfer: Transfer) => void;
    updateTransfer: (id: string, updates: Partial<Transfer>) => void;
    updateProgress: (id: string, transferredSize: number, speed: number) => void;
    cancelTransfer: (id: string) => void;
    removeTransfer: (id: string) => void;
    clearCompletedTransfers: () => void;

    // Incoming request state
    incomingRequest: {
        sessionId: string;
        sender: Device;
        files: FileInfo[];
    } | null;
    setIncomingRequest: (request: { sessionId: string; sender: Device; files: FileInfo[] } | null) => void;

    // File selection
    addFiles: (files: FileInfo[]) => void;
    removeFile: (fileId: string) => void;
    clearFiles: () => void;
}

export const useTransferStore = create<TransferStore>((set) => ({
    transfers: [],
    selectedFiles: [],
    incomingRequest: null,
    setIncomingRequest: (request) => set({ incomingRequest: request }),

    addTransfer: (transfer) =>
        set((state) => ({
            transfers: [...state.transfers, transfer],
        })),

    updateTransfer: (id, updates) =>
        set((state) => ({
            transfers: state.transfers.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        })),

    updateProgress: (id, transferredSize, speed) =>
        set((state) => ({
            transfers: state.transfers.map((t) => {
                if (t.id !== id) return t;
                const progress = Math.min(
                    100,
                    (transferredSize / t.totalSize) * 100
                );
                return { ...t, transferredSize, speed, progress };
            }),
        })),

    cancelTransfer: (id) =>
        set((state) => ({
            transfers: state.transfers.map((t) =>
                t.id === id ? { ...t, status: 'cancelled' as const } : t
            ),
        })),

    removeTransfer: (id) =>
        set((state) => ({
            transfers: state.transfers.filter((t) => t.id !== id),
        })),

    clearCompletedTransfers: () =>
        set((state) => ({
            transfers: state.transfers.filter(
                (t) => t.status !== 'completed' && t.status !== 'cancelled' && t.status !== 'failed'
            ),
        })),

    addFiles: (files) =>
        set((state) => ({
            selectedFiles: [...state.selectedFiles, ...files],
        })),

    removeFile: (fileId) =>
        set((state) => ({
            selectedFiles: state.selectedFiles.filter((f) => f.id !== fileId),
        })),

    clearFiles: () => set({ selectedFiles: [] }),
}));
