# Custom Car HUD App

A minimalist heads-up display app for Android tablets that provides:
- Simplified turn-by-turn navigation with lane guidance
- Real-time speed display via OBD2 Bluetooth connection
- Offline maps support
- Remote control via web interface (accessible from iPhone)
- Windshield reflection mode

## Architecture

- **Display App**: Android tablet app (React Native)
- **Remote Control**: Web interface accessible via local network
- **Navigation**: MapLibre with offline maps
- **Speed Data**: OBD2 Bluetooth connection
- **Connectivity**: WiFi Direct for phone-to-tablet control

## Tech Stack

- React Native (TypeScript)
- MapLibre (offline navigation)
- Bluetooth Low Energy (OBD2)
- Express.js (local web server)

## Development

All development is done via command line - no Android Studio required.

### Build Commands

```bash
# Run on device
npx react-native run-android

# Build APK
cd android && ./gradlew assembleRelease
```

## Project Status

- [x] Environment setup
- [x] React Native initialization
- [ ] Navigation implementation
- [ ] OBD2 Bluetooth
- [ ] HUD UI
- [ ] Web control interface
- [ ] APK build and testing

## Project Structure

```
HUD/
├── HUDApp/               # React Native application
│   ├── android/          # Android native code
│   ├── App.tsx           # Main app component
│   └── package.json      # Dependencies
├── android-env.sh        # Environment configuration
├── setup-android-sdk.sh  # SDK setup script
└── README.md             # This file
```

## Setup Instructions

### 1. Environment Setup

```bash
# Load environment variables
source android-env.sh

# Verify setup
java -version    # Should show Java 17+
sdkmanager --version
```

### 2. Running the App

```bash
cd HUDApp

# Run on connected device/emulator
npx react-native run-android
```

### 3. Building APK

```bash
cd HUDApp/android
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```
