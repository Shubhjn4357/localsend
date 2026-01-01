const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable minification and optimization
config.transformer.minifierConfig = {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
        keep_classnames: true,
        keep_fnames: true,
    },
};

// Enable asset compression
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;
