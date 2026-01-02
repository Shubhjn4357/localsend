import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useShareIntent, ShareIntent } from 'expo-share-intent';

export interface ReceivedShare {
    files: Array<{
        uri: string;
        mimeType?: string;
        fileName?: string;
    }>;
    text?: string;
    webUrl?: string;
}

/**
 * Hook to receive files shared from other apps (Quick Share/AirDrop)
 * Only works on Android and iOS, not web
 */
export function useReceiveShare(onShare?: (share: ReceivedShare) => void) {
    const { hasShareIntent, shareIntent, error } = useShareIntent();
    const [receivedShare, setReceivedShare] = useState<ReceivedShare | null>(null);

    const processShareIntent = useCallback((intent: ShareIntent) => {
        const received: ReceivedShare = {
            files: [],
            text: intent.text ?? undefined,
            webUrl: intent.webUrl ?? undefined,
        };

        // Process files
        if (intent.files && intent.files.length > 0) {
            received.files = intent.files.map((file) => ({
                uri: file.path,
                mimeType: file.mimeType,
                fileName: file.fileName || file.path.split('/').pop(),
            }));
        }

        setReceivedShare(received);

        if (onShare) {
            onShare(received);
        }
    }, [onShare]);

    useEffect(() => {
        if (hasShareIntent && shareIntent) {
            processShareIntent(shareIntent);
        }
    }, [hasShareIntent, shareIntent, processShareIntent]);

    useEffect(() => {
        if (error) {
            console.error('Share intent error:', error);
        }
    }, [error]);

    const clearShare = useCallback(() => {
        setReceivedShare(null);
    }, []);

    return {
        hasShare: hasShareIntent,
        receivedShare,
        clearShare,
        error,
    };
}
