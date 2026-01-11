import { Platform } from 'react-native';
import { File, Directory, Paths } from 'expo-file-system/next';
import forge from 'node-forge';

const CERT_DIR_NAME = 'certs';

export interface TlsCertificate {
    key: string;
    cert: string;
    fingerprint: string;
}

class TlsService {
    private certificate: TlsCertificate | null = null;
    private isGenerating = false;

    /**
     * Initialize TLS service: load or generate certificates
     */
    async initialize(): Promise<TlsCertificate> {
        if (this.certificate) {
            return this.certificate;
        }

        // Prevent multiple simultaneous generations
        if (this.isGenerating) {
            // Wait for ongoing generation to complete
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.certificate) {
                        clearInterval(checkInterval);
                        resolve(this.certificate);
                    }
                }, 100);
            });
        }

        try {
            const certDir = new Directory(Paths.document, CERT_DIR_NAME);

            // Ensure cert directory exists
            if (!certDir.exists) {
                console.log('Creating certs directory...');
                certDir.create();
            }

            const keyFile = new File(certDir, 'server.key');
            const certFile = new File(certDir, 'server.crt');

            // Check if certs exist
            if (keyFile.exists && certFile.exists) {
                console.log('Loading existing TLS certificates...');
                const key = await keyFile.text();
                const cert = await certFile.text();
                const fingerprint = this.computeFingerprint(cert);

                this.certificate = { key, cert, fingerprint };
                return this.certificate;
            }

            // Generate new if missing
            console.log('Generating new TLS certificates (async)...');
            return await this.generateCertificate(keyFile, certFile);
        } catch (error) {
            console.error('Failed to initialize TLS:', error);
            throw error;
        }
    }

    /**
     * Generate a self-signed certificate using node-forge with async key generation
     * This prevents blocking the main UI thread during CPU-intensive RSA key generation
     */
    private async generateCertificate(keyFile: File, certFile: File): Promise<TlsCertificate> {
        this.isGenerating = true;

        try {
            // Use async key generation to avoid blocking the UI
            const keys = await this.generateKeyPairAsync(2048);
            
            const cert = forge.pki.createCertificate();

            cert.publicKey = keys.publicKey;
            cert.serialNumber = '01' + forge.util.bytesToHex(forge.random.getBytesSync(10));

            // Set validity (10 years)
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

            // Set attributes
            const attrs = [{
                name: 'commonName',
                value: 'LocalSend Secure'
            }, {
                name: 'organizationName',
                value: 'LocalSend'
            }];

            cert.setSubject(attrs);
            cert.setIssuer(attrs);

            // Set extensions
            cert.setExtensions([{
                name: 'basicConstraints',
                cA: true
            }, {
                name: 'keyUsage',
                keyCertSign: true,
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true
            }, {
                name: 'extKeyUsage',
                serverAuth: true,
                clientAuth: true,
                codeSigning: true,
                emailProtection: true,
                timeStamping: true
            }, {
                name: 'subjectAltName',
                altNames: [{
                    type: 6, // URI
                    value: 'http://localsend.local'
                }, {
                    type: 7, // IP
                    ip: '127.0.0.1'
                }]
            }]);

            // Self-sign
            cert.sign(keys.privateKey, forge.md.sha256.create());

            // Convert to PEM
            const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
            const certPem = forge.pki.certificateToPem(cert);

            // Save to filesystem (synchronous in new API, but fast)
            keyFile.write(privateKeyPem);
            certFile.write(certPem);

            const fingerprint = this.computeFingerprint(certPem);

            this.certificate = {
                key: privateKeyPem,
                cert: certPem,
                fingerprint
            };

            console.log('TLS Certificates generated successfully');
            return this.certificate;

        } catch (error) {
            console.error('Certificate generation failed:', error);
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * Async wrapper for RSA key pair generation
     * Uses node-forge's async callback API to prevent blocking the main thread
     */
    private generateKeyPairAsync(bits: number): Promise<forge.pki.rsa.KeyPair> {
        return new Promise((resolve, reject) => {
            console.log(`Generating ${bits}-bit RSA key pair asynchronously...`);
            
            forge.pki.rsa.generateKeyPair(
                { bits, workers: -1 }, // workers: -1 uses Web Workers when available
                (err, keypair) => {
                    if (err) {
                        console.error('RSA key generation failed:', err);
                        reject(err);
                    } else {
                        console.log('RSA key pair generated successfully');
                        resolve(keypair);
                    }
                }
            );
        });
    }

    /**
     * Compute SHA256 fingerprint of the certificate (for pinning)
     */
    private computeFingerprint(certPem: string): string {
        const cert = forge.pki.certificateFromPem(certPem);
        const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
        const md = forge.md.sha256.create();
        md.update(der);
        return md.digest().toHex().toUpperCase().match(/.{1,2}/g)?.join(':') || '';
    }

    getCertificate(): TlsCertificate | null {
        return this.certificate;
    }
}

export const tlsService = new TlsService();
