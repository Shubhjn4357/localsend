const { withInfoPlist, withEntitlementsPlist, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin for NearDrop Protocol
 * Automatically copies Swift native code and configures iOS/macOS project
 */
function withNearDrop(config) {
  // Add Bonjour services for mDNS discovery
  config = withInfoPlist(config, (config) => {
    if (!config.modResults.NSBonjourServices) {
      config.modResults.NSBonjourServices = [];
    }

    const services = [
      '_googlercast._tcp',  // NearDrop/Android
      '_localsend._tcp',    // LocalSend discovery
    ];

    services.forEach(service => {
      if (!config.modResults.NSBonjourServices.includes(service)) {
        config.modResults.NSBonjourServices.push(service);
      }
    });

    // Add local network usage description
    config.modResults.NSLocalNetworkUsageDescription =
      'LocalSend needs to discover devices on your local network for fast file transfers';

    // Add network client/server permissions for macOS
    config.modResults.NSAppTransportSecurity = {
      NSAllowsLocalNetworking: true,
      NSAllowsArbitraryLoads: false
    };

    return config;
  });

  // Add network entitlements (macOS/iOS)
  config = withEntitlementsPlist(config, (config) => {
    // Network permissions
    config.modResults['com.apple.security.network.client'] = true;
    config.modResults['com.apple.security.network.server'] = true;
    config.modResults['com.apple.developer.networking.multicast'] = true;

    // Allow incoming connections (macOS)
    config.modResults['com.apple.security.files.user-selected.read-write'] = true;

    return config;
  });

  // Copy Swift native files from modules/
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformRoot = config.modRequest.platformProjectRoot;
      const projectName = config.modRequest.projectName || 'localsend';

      // Target directory in iOS project
      const nearDropDir = path.join(platformRoot, projectName, 'NearDrop');

      // Create directory
      if (!fs.existsSync(nearDropDir)) {
        fs.mkdirSync(nearDropDir, { recursive: true });
      }

      // Source files in modules/
      const sourceDir = path.join(projectRoot, 'modules/neardrop/ios');

      // Copy NearDropModule.swift
      const swiftSrc = path.join(sourceDir, 'NearDropModule.swift');
      const swiftDst = path.join(nearDropDir, 'NearDropModule.swift');
      if (fs.existsSync(swiftSrc)) {
        fs.copyFileSync(swiftSrc, swiftDst);
        console.log('✅ Copied NearDropModule.swift');
      } else {
        console.warn('⚠️  NearDropModule.swift not found at:', swiftSrc);
      }

      // Copy NearDropModule.m (bridge)
      const bridgeSrc = path.join(sourceDir, 'NearDropModule.m');
      const bridgeDst = path.join(nearDropDir, 'NearDropModule.m');
      if (fs.existsSync(bridgeSrc)) {
        fs.copyFileSync(bridgeSrc, bridgeDst);
        console.log('✅ Copied NearDropModule.m');
      } else {
        console.warn('⚠️  NearDropModule.m not found at:', bridgeSrc);
      }

      return config;
    },
  ]);

  return config;
}

module.exports = withNearDrop;
