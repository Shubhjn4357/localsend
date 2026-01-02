import { EventEmitter } from 'events';
import type { TransferRequest } from '@/types/transfer';

interface TransferEventData {
    sessionId: string;
    request: TransferRequest;
}

class TransferEventEmitter extends EventEmitter {
    emitIncomingTransfer(sessionId: string, request: TransferRequest) {
        this.emit('incomingTransfer', { sessionId, request });
    }

    onIncomingTransfer(callback: (data: TransferEventData) => void) {
        this.on('incomingTransfer', callback);
    }

    offIncomingTransfer(callback: (data: TransferEventData) => void) {
        this.off('incomingTransfer', callback);
    }

    emitTransferAccepted(sessionId: string) {
        this.emit('transferAccepted', sessionId);
    }

    onTransferAccepted(callback: (sessionId: string) => void) {
        this.on('transferAccepted', callback);
    }

    offTransferAccepted(callback: (sessionId: string) => void) {
        this.off('transferAccepted', callback);
    }

    emitTransferRejected(sessionId: string) {
        this.emit('transferRejected', sessionId);
    }

    onTransferRejected(callback: (sessionId: string) => void) {
        this.on('transferRejected', callback);
    }

    offTransferRejected(callback: (sessionId: string) => void) {
        this.off('transferRejected', callback);
    }
}

export const transferEvents = new TransferEventEmitter();
