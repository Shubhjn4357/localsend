import TcpSocket from 'react-native-tcp-socket';
import type TLSServer from 'react-native-tcp-socket/lib/types/TLSServer';
import type TLSSocket from 'react-native-tcp-socket/lib/types/TLSSocket';
import type Socket from 'react-native-tcp-socket/lib/types/Socket';
import { tlsService } from '../security/tlsService';
import { useSettingsStore } from '@/stores/settingsStore';
import { Platform } from 'react-native';

class ReverseProxyService {
    private server: TLSServer | null = null;
    private isRunning = false;
    private securePort = 53318;
    private targetPort = 53317;
    private targetHost = '127.0.0.1';

    async start(): Promise<boolean> {
        if (Platform.OS === 'web') {
            console.log('Reverse Proxy not supported on web');
            return false;
        }

        if (this.isRunning) {
            return true;
        }

        try {
            // Get certificates
            const certs = await tlsService.initialize();

            // Get settings (if ports are custom)
            const settings = useSettingsStore.getState();
            this.targetPort = settings.serverPort || 53317;
            this.securePort = this.targetPort + 1; // Conventional: HTTP+1

            console.log(`Starting TLS Reverse Proxy on port ${this.securePort} -> ${this.targetPort}`);

            // Note: react-native-tcp-socket TLSServerOptions expects 'keystore' for Android
            // For cross-platform PEM support, we pass cert/key which the library handles internally
            this.server = TcpSocket.createTLSServer({
                // @ts-expect-error - Library accepts cert/key strings but types expect keystore
                cert: certs.cert,
                key: certs.key,
                requestCert: false,
                rejectUnauthorized: false,
            }, (socket: TLSSocket) => {
                // Handle new secure connection
                // Create connection to internal HTTP server
                const internalClient: Socket = TcpSocket.createConnection({
                    port: this.targetPort,
                    host: this.targetHost,
                }, () => {
                    // Connection established callback
                });

                // Pipe data between sockets manually
                socket.on('data', (data: Buffer | string) => {
                    try {
                        internalClient.write(data as Buffer);
                    } catch (e) {
                        // Ignore write errors
                    }
                });

                internalClient.on('data', (data: Buffer | string) => {
                    try {
                        socket.write(data as Buffer);
                    } catch (e) {
                        // Ignore write errors
                    }
                });

                // Error handling
                socket.on('error', (err: Error) => {
                    console.log('Proxy external socket error:', err.message);
                    internalClient.destroy();
                });

                internalClient.on('error', (err: Error) => {
                    console.log('Proxy internal socket error:', err.message);
                    socket.destroy();
                });

                socket.on('close', () => {
                    internalClient.destroy();
                });

                internalClient.on('close', () => {
                    socket.destroy();
                });
            });

            this.server.listen({ port: this.securePort, host: '0.0.0.0' }, () => {
                console.log(`Reverse Proxy listening on ${this.securePort}`);
                this.isRunning = true;
            });

            this.server.on('error', (err: Error) => {
                console.error('Reverse Proxy Server Error:', err);
                this.isRunning = false;
            });

            return true;
        } catch (error) {
            console.error('Failed to start Reverse Proxy:', error);
            return false;
        }
    }

    stop() {
        if (this.server) {
            this.server.close();
            this.server = null;
            this.isRunning = false;
            console.log('Reverse Proxy stopped');
        }
    }

    getSecurePort(): number {
        return this.securePort;
    }
}

export const reverseProxyService = new ReverseProxyService();
