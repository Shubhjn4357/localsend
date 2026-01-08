# LocalSend

A modern, open-source local file sharing application built with Expo and React Native. Share files securely over your local network without internet connectivity.

## ✨ Features

- 🔍 **Automatic Device Discovery** - Find nearby devices instantly with auto-discovery
- 🎯 **Numeric Device IDs** - Easy 6-digit numeric IDs (#123456) for manual connections
- 🖼️ **File Previews** - See actual image thumbnails and video previews
- 👆 **Tap to Preview** - Full-screen file preview with pinch-to-zoom
- 🚀 **Fast Transfers** - Direct peer-to-peer transfers with optimization
- 🌊 **Protocol Auto-Select** - Bluetooth, Wi-Fi Direct, NearDrop, or HTTP
- 📝 **What's New** - Integrated changelog in settings
- 👋 **Onboarding** - Friendly first-time user guide
- 🔒 **Secure** - All transfers encrypted and direct
- 🎨 **Beautiful UI** - Material Design 3 with glassmorphism
- 📱 **Cross-Platform** - iOS, Android, and Web support
- 🌓 **Theme Support** - Automatic light/dark mode with custom color schemes
- 📦 **Multi-File Support** - Send multiple files at once
- ⚡ **Performance Optimized** - React.memo, useCallback, useMemo throughout

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI
- For iOS: Xcode and CocoaPods
- For Android: Android Studio

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

### Building for Production

This app requires native modules and cannot run in Expo Go. You need to create a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Create production build
eas build --profile production --platform all
```

## 📱 Usage

1. **Open the app** on two or more devices connected to the same Wi-Fi network
2. **Devices will appear automatically** in the discovery list
3. **Select a device** to send files to
4. **Choose files** from your device
5. **Send** and accept on the receiving device
6. **Transfer complete!**

## ⚙️ Configuration

### Settings

- **Device Name**: Customize how your device appears to others
- **Server Port**: Change the HTTP server port (default: 53317)
- **Auto Accept**: Automatically accept incoming file transfers
- **Save Directory**: Choose where received files are saved
- **Theme**: Light, Dark, or Auto (system)

## 🛠️ Tech Stack

- **Framework**: Expo SDK 54 + React Native
- **UI**: React Native Paper (Material Design 3)
- **Styling**: Glassmorphism with expo-blur
- **Networking**: react-native-udp, expo-http-server
- **State**: Zustand
- **Animations**: React Native Reanimated 3
- **Language**: TypeScript

## 🌐 Platform Support

| Feature           | iOS | Android | Web |
| ----------------- | --- | ------- | --- |
| Device Discovery  | ✅  | ✅      | ❌  |
| File Transfers    | ✅  | ✅      | ❌  |
| UI/UX             | ✅  | ✅      | ✅  |
| Background Server | ⚠️  | ✅      | ❌  |

_Note: Web platform is limited to UI demonstration only due to browser security restrictions on UDP multicast and local servers._

## 📝 License

MIT

## 🙏 Acknowledgments

Based on the LocalSend protocol and inspired by the open-source LocalSend project.

## 🐛 Troubleshooting

### Devices not appearing?

- Ensure both devices are on the same Wi-Fi network
- Check that multicast is not blocked by your router
- Try refreshing the device list
- Restart the app

### Transfers failing?

- Check network connectivity
- Verify firewall settings
- Ensure sufficient storage space

## 📫 Support

For issues and feature requests, please open an issue on GitHub.
