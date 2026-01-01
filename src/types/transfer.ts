export interface FileInfo {
    id: string;
    fileName: string;
    size: number;
    fileType: string;
    preview?: string;
    uri: string;
    mimeType?: string;
}

export interface Transfer {
    id: string;
    sessionId: string;
    direction: 'send' | 'receive';
    device: {
        fingerprint: string;
        alias: string;
    };
    files: FileInfo[];
    totalSize: number;
    transferredSize: number;
    status: 'pending' | 'accepted' | 'transferring' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    speed: number; // bytes per second
    startTime?: number;
    endTime?: number;
    error?: string;
}

export interface TransferRequest {
    info: {
        alias: string;
        version: string;
        deviceModel?: string;
        deviceType: string;
        fingerprint: string;
    };
    files: {
        [key: string]: {
            id: string;
            fileName: string;
            size: number;
            fileType: string;
            preview?: string;
        };
    };
}

export interface TransferResponse {
    sessionId: string;
    files: {
        [key: string]: string; // fileId -> token
    };
}
