const { withAndroidManifest, withAppBuildGradle, withMainApplication, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin for Google Nearby Connections API
 * Copies Java files from modules/ folder and configures Android project
 */
function withNearbyConnections(config) {
    // 1. Add Android permissions
    config = withAndroidManifest(config, (config) => {
        const androidManifest = config.modResults.manifest;

        if (!androidManifest['uses-permission']) {
            androidManifest['uses-permission'] = [];
        }

        const permissions = [
            'android.permission.ACCESS_WIFI_STATE',
            'android.permission.CHANGE_WIFI_STATE',
            'android.permission.ACCESS_COARSE_LOCATION',
            'android.permission.ACCESS_FINE_LOCATION',
            'android.permission.BLUETOOTH',
            'android.permission.BLUETOOTH_ADMIN',
            'android.permission.NEARBY_WIFI_DEVICES',
        ];

        permissions.forEach(permission => {
            if (!androidManifest['uses-permission'].some(p => p.$['android:name'] === permission)) {
                androidManifest['uses-permission'].push({
                    $: { 'android:name': permission }
                });
            }
        });

        return config;
    });

    // 2. Add Google Play Services dependency
    config = withAppBuildGradle(config, (config) => {
        if (!config.modResults.contents.includes('com.google.android.gms:play-services-nearby')) {
            config.modResults.contents = config.modResults.contents.replace(
                /dependencies\s*{/,
                `dependencies {
    implementation 'com.google.android.gms:play-services-nearby:19.0.0'`
            );
        }
        return config;
    });

    // 3. Register the package in MainApplication
    config = withMainApplication(config, (config) => {
        const { modResults } = config;
        const { language, contents } = modResults;

        if (language === 'java') {
            if (!contents.includes('NearbyConnectionsPackage')) {
                let newContents = contents.replace(
                    /import com\.facebook\.react\.defaults\.DefaultReactNativeHost;/,
                    `import com.facebook.react.defaults.DefaultReactNativeHost;\nimport com.localsend.nearby.NearbyConnectionsPackage;`
                );

                newContents = newContents.replace(
                    /packages\.add\(new MainReactPackage\(\)\);/,
                    `packages.add(new MainReactPackage());\n          packages.add(new NearbyConnectionsPackage());`
                );

                modResults.contents = newContents;
            }
        } else if (language === 'kt' || language === 'kotlin') {
            if (!contents.includes('NearbyConnectionsPackage')) {
                let newContents = contents.replace(
                    /import expo\.modules\.ReactNativeHostWrapper/,
                    `import expo.modules.ReactNativeHostWrapper\nimport com.localsend.nearby.NearbyConnectionsPackage`
                );

                newContents = newContents.replace(
                    /\/\/ add\(MyReactNativePackage\(\)\)/,
                    `// add(MyReactNativePackage())\n              add(NearbyConnectionsPackage())`
                );

                modResults.contents = newContents;
            }
        }

        return config;
    });

    // 4. Copy native Java files from modules/
    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const nearbyDir = path.join(
                config.modRequest.platformProjectRoot,
                'app/src/main/java/com/localsend/nearby'
            );

            // Create directory
            if (!fs.existsSync(nearbyDir)) {
                fs.mkdirSync(nearbyDir, { recursive: true });
            }

            // Source files in modules/
            const sourceDir = path.join(
                projectRoot,
                'modules/nearby-connections/android/src/main/java/com/localsend/nearby'
            );

            // Copy NearbyConnectionsModule.java
            const moduleSrc = path.join(sourceDir, 'NearbyConnectionsModule.java');
            const moduleDst = path.join(nearbyDir, 'NearbyConnectionsModule.java');
            if (fs.existsSync(moduleSrc)) {
                fs.copyFileSync(moduleSrc, moduleDst);
                console.log('✅ Copied NearbyConnectionsModule.java');
            } else {
                console.warn('⚠️  NearbyConnectionsModule.java not found at:', moduleSrc);
            }

            // Copy NearbyConnectionsPackage.java
            const packageSrc = path.join(sourceDir, 'NearbyConnectionsPackage.java');
            const packageDst = path.join(nearbyDir, 'NearbyConnectionsPackage.java');
            if (fs.existsSync(packageSrc)) {
                fs.copyFileSync(packageSrc, packageDst);
                console.log('✅ Copied NearbyConnectionsPackage.java');
            } else {
                console.warn('⚠️  NearbyConnectionsPackage.java not found at:', packageSrc);
            }

            return config;
        },
    ]);

    return config;
}

module.exports = withNearbyConnections;
