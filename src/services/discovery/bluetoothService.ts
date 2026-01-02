import { Platform, PermissionsAndroid, NativeEventEmitter, NativeModules } from 'react-native';
import BleManager, { Peripheral } from 'react-native-ble-manager';
import { useDeviceStore } from '@/stores/deviceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Device } from '@/types/device';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const LOCALSEND_BLE_SERVICE_UUID = '0000180A-0000-1000-8000-00805F9B34FB'; // Device Information Service

interface BluetoothServiceType {
    isScanning: boolean;
    isEnabled: boolean;
    initialize(): Promise<boolean>;
    startDiscovery(): Promise<void>;
    stopDiscovery(): Promise<void>;
    sendFile(device: Device, file: any): Promise<boolean>;
    requestPermissions(): Promise<boolean>;
}

class BluetoothService implements BluetoothServiceType {
    isScanning = false;
    isEnabled = false;
    private discoveredDevices = new Map<string, Peripheral>();
    private scanListener: any = null;

    async initialize(): Promise<boolean> {
        if (Platform.OS === 'web') {
            console.log('Bluetooth not supported on web');
            return false;
        }

        try {
            // Start BLE Manager
            await BleManager.start({ showAlert: false });
            console.log('BLE Manager initialized');

            // Check if Bluetooth is enabled
            await BleManager.checkState();

            // Set up state change listener
            bleManagerEmitter.addListener('BleManagerDidUpdateState', ({ state }) => {
                console.log('BLE state changed:', state);
                this.isEnabled = state === 'on';
            });

            this.isEnabled = true;
            return true;
        } catch (error) {
            console.error('BLE initialization error:', error);
            return false;
        }
    }

    async requestPermissions(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return true;
        }

        try {
            const apiLevel = Platform.Version;

            // Android 12+ (API 31+) requires new Bluetooth permissions
            if (apiLevel >= 31) {
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ];

                const result = await PermissionsAndroid.requestMultiple(permissions);

                return Object.values(result).every(
                    (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
                );
            } else {
                // Android 11 and below
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                ];

                const result = await PermissionsAndroid.requestMultiple(permissions);

                return Object.values(result).every(
                    (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
                );
            }
        } catch (error) {
            console.error('BLE permission request error:', error);
            return false;
        }
    }

    async startDiscovery(): Promise<void> {
        if (Platform.OS === 'web') return;
        if (this.isScanning) return;

        // Check if Bluetooth is enabled in settings
        const settingsStore = useSettingsStore.getState();
        if (!settingsStore.bluetoothEnabled) {
            console.log('Bluetooth disabled in settings');
            return;
        }

        try {
            // Request permissions first
            const hasPermissions = await this.requestPermissions();
            if (!hasPermissions) {
                console.log('BLE permissions not granted');
                return;
            }

            // Initialize if not already
            if (!this.isEnabled) {
                const initialized = await this.initialize();
                if (!initialized) {
                    console.log('BLE initialization failed');
                    return;
                }
            }

            this.isScanning = true;
            this.discoveredDevices.clear();
            console.log('Starting BLE discovery...');

            // Listen for discovered peripherals
            this.scanListener = bleManagerEmitter.addListener(
                'BleManagerDiscoverPeripheral',
                (peripheral: Peripheral) => {
                    console.log('Discovered BLE peripheral:', peripheral.name, peripheral.id);
                    this.discoveredDevices.set(peripheral.id, peripheral);
                    this.addBLEDevice(peripheral);
                }
            );

            // Start scanning for BLE devices with ScanOptions
            await BleManager.scan({
                seconds: 30, // 30 seconds scan duration
                allowDuplicates: true,
                serviceUUIDs: [], // Empty = scan all devices
            });

            // Auto-stop after 30 seconds
            setTimeout(() => {
                this.stopDiscovery();
            }, 30000);

        } catch (error) {
            console.error('BLE discovery error:', error);
            this.isScanning = false;
        }
    }

    async stopDiscovery(): Promise<void> {
        if (!this.isScanning) return;

        try {
            console.log('Stopping BLE discovery...');
            await BleManager.stopScan();

            if (this.scanListener) {
                this.scanListener.remove();
                this.scanListener = null;
            }

            this.isScanning = false;
        } catch (error) {
            console.error('BLE stop discovery error:', error);
        }
    }

    private addBLEDevice(peripheral: Peripheral) {
        const deviceStore = useDeviceStore.getState();

        // Filter for LocalSend-compatible devices
        // For now, we add all discovered BLE devices with Bluetooth connection type
        // In production, check for specific service UUID or device name pattern

        const device: Device = {
            fingerprint: `ble_${peripheral.id}`,
            alias: peripheral.name || peripheral.advertising?.localName || 'Unknown BLE Device',
            deviceModel: 'BLE Device',
            deviceType: 'mobile',
            ipAddress: '', // BLE doesn't use IP
            port: 0, // BLE doesn't use ports
            protocol: 'bluetooth',
            version: '2.0',
            lastSeen: Date.now(),
            isOnline: true,
            // BLE specific
            bluetoothAddress: peripheral.id,
            connectionType: 'bluetooth',
        };

        // Add or update device
        const existing = deviceStore.devices.find(d => d.fingerprint === device.fingerprint);
        if (!existing) {
            deviceStore.addDevice(device);
        } else {
            deviceStore.updateDevice(device.fingerprint, {
                isOnline: true,
                lastSeen: Date.now(),
            });
        }
    }

    async sendFile(device: Device, file: any): Promise<boolean> {
        if (Platform.OS === 'web' || !device.bluetoothAddress) {
            return false;
        }

        try {
            console.log('Connecting to BLE device:', device.bluetoothAddress);

            // Connect to the peripheral
            await BleManager.connect(device.bluetoothAddress);
            console.log('Connected to BLE device');

            // Retrieve services and characteristics
            const peripheralInfo = await BleManager.retrieveServices(device.bluetoothAddress);
            console.log('Retrieved services:', peripheralInfo);

            // TODO: Implement file transfer over BLE
            // This requires:
            // 1. Define custom GATT service/characteristic for LocalSend
            // 2. Chunk file into MTU-sized packets (typically 20-512 bytes)
            // 3. Write each chunk to characteristic
            // 4. Handle acknowledgments

            // For now, this is a placeholder
            console.log('BLE file transfer not fully implemented yet');

            return false;

        } catch (error) {
            console.error('BLE file transfer error:', error);
            return false;
        } finally {
            // Disconnect after transfer
            try {
                if (device.bluetoothAddress) {
                    await BleManager.disconnect(device.bluetoothAddress);
                }
            } catch (e) {
                console.error('BLE disconnect error:', e);
            }
        }
    }
}

export const bluetoothService = new BluetoothService();
