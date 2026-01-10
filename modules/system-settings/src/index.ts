import { NativeModules } from 'react-native';

const { SystemSettingsModule } = NativeModules;

export interface SystemSettings {
  /**
   * Check if WiFi is currently enabled
   */
  isWiFiEnabled(): Promise<boolean>;

  /**
   * Check if Bluetooth is currently enabled
   */
  isBluetoothEnabled(): Promise<boolean>;

  /**
   * Open system WiFi settings
   */
  openWiFiSettings(): void;

  /**
   * Open system Bluetooth settings
   */
  openBluetoothSettings(): void;

  /**
   * Open location settings (needed for Bluetooth scanning)
   */
  openLocationSettings(): void;

  /**
   * Request location permission (required for Bluetooth scanning on Android)
   */
  requestLocationPermission(): Promise<boolean>;

  /**
   * Check if location permission is granted
   */
  hasLocationPermission(): Promise<boolean>;
}

export default SystemSettingsModule as SystemSettings;
