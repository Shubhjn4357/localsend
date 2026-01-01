import { create } from 'zustand';

export interface ActiveTransfer {
    id: string;
    fileName: string;
    fileSize: number;
    bytesTransferred: number;
    progress: number; // 0-1
    status: 'pending' | 'sending' | 'receiving' | 'completed' | 'failed' | 'cancelled';
    deviceName: string;
    deviceId: string;
    startTime: number;
    estimatedTimeRemaining?: number;
    speed?: number; // bytes per second
    errorMessage?: string;
}

interface ActiveTransfersStore {
    transfers: ActiveTransfer[];

    // Actions
    startTransfer: (transfer: Omit<ActiveTransfer, 'progress' | 'bytesTransferred' | 'startTime'>) => void;
    updateTransferProgress: (id: string, bytesTransferred: number) => void;
    updateTransferStatus: (id: string, status: ActiveTransfer['status'], errorMessage?: string) => void;
    cancelTransfer: (id: string) => void;
    removeTransfer: (id: string) => void;
    clearCompleted: () => void;
}

export const useActiveTransfersStore = create<ActiveTransfersStore>((set, get) => ({
    transfers: [],

    startTransfer: (transfer) => {
        const newTransfer: ActiveTransfer = {
            ...transfer,
            progress: 0,
            bytesTransferred: 0,
            startTime: Date.now(),
        };
        set((state) => ({
            transfers: [...state.transfers, newTransfer],
        }));
    },

    updateTransferProgress: (id, bytesTransferred) => {
        set((state) => ({
            transfers: state.transfers.map((transfer) => {
                if (transfer.id !== id) return transfer;

                const progress = transfer.fileSize > 0 ? bytesTransferred / transfer.fileSize : 0;
                const elapsedTime = (Date.now() - transfer.startTime) / 1000; // seconds
                const speed = bytesTransferred / elapsedTime; // bytes per second
                const remainingBytes = transfer.fileSize - bytesTransferred;
                const estimatedTimeRemaining = speed > 0 ? remainingBytes / speed : undefined;

                return {
                    ...transfer,
                    bytesTransferred,
                    progress,
                    speed,
                    estimatedTimeRemaining,
                };
            }),
        }));
    },

    updateTransferStatus: (id, status, errorMessage) => {
        set((state) => ({
            transfers: state.transfers.map((transfer) =>
                transfer.id === id
                    ? {
                        ...transfer,
                        status,
                        errorMessage,
                        estimatedTimeRemaining: status === 'completed' || status === 'failed' ? 0 : transfer.estimatedTimeRemaining,
                    }
                    : transfer
            ),
        }));
    },

    cancelTransfer: (id) => {
        get().updateTransferStatus(id, 'cancelled');
    },

    removeTransfer: (id) => {
        set((state) => ({
            transfers: state.transfers.filter((transfer) => transfer.id !== id),
        }));
    },

    clearCompleted: () => {
        set((state) => ({
            transfers: state.transfers.filter(
                (transfer) => transfer.status !== 'completed' && transfer.status !== 'failed' && transfer.status !== 'cancelled'
            ),
        }));
    },
}));
