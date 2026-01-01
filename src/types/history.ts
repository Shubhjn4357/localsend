export type TransferStatus = 'pending' | 'sending' | 'receiving' | 'completed' | 'failed' | 'cancelled';
export type TransferDirection = 'sent' | 'received';

export interface FileInfo {
    name: string;
    size: number;
    type: string;
    path?: string;
}

export interface HistoryItem {
    id: string;
    timestamp: number;
    direction: TransferDirection;
    status: TransferStatus;
    deviceName: string;
    deviceId: string;
    files: FileInfo[];
    totalSize: number;
    errorMessage?: string;
}

export interface HistoryFilter {
    direction?: TransferDirection;
    status?: TransferStatus;
    deviceId?: string;
    startDate?: number;
    endDate?: number;
}
