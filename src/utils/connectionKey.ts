/**
 * Connection Key Utilities
 * Generate and validate connection keys for easy device pairing
 */

/**
 * Generate connection key from device fingerprint
 * Format: XXXX-YYYY (8 characters, uppercase)
 * Example: A7F3-9B2E
 */
export function generateConnectionKey(fingerprint: string): string {
  const hash = fingerprint.slice(0, 8).toUpperCase();
  return `${hash.slice(0, 4)}-${hash.slice(4, 8)}`;
}

/**
 * Validate connection key format
 * Must be 9 characters: XXXX-YYYY
 */
export function isValidConnectionKey(key: string): boolean {
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key);
}

/**
 * Normalize connection key (remove spaces, convert to uppercase, add dash)
 */
export function normalizeConnectionKey(input: string): string {
  // Remove all non-alphanumeric characters
  const cleaned = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Add dash after 4 characters if not present
  if (cleaned.length >= 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
  }
  
  return cleaned;
}

/**
 * Match connection key to device fingerprint
 */
export function matchKeyToFingerprint(key: string, fingerprint: string): boolean {
  const normalizedKey = normalizeConnectionKey(key);
  const deviceKey = generateConnectionKey(fingerprint);
  return normalizedKey === deviceKey;
}

/**
 * Find device by connection key
 */
export function findDeviceByKey(key: string, devices: Array<{ fingerprint: string }>): any | null {
  const normalizedKey = normalizeConnectionKey(key);
  
  for (const device of devices) {
    const deviceKey = generateConnectionKey(device.fingerprint);
    if (normalizedKey === deviceKey) {
      return device;
    }
  }
  
  return null;
}
