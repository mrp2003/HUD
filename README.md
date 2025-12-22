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

- [ ] Environment setup
- [ ] React Native initialization
- [ ] Navigation implementation
- [ ] OBD2 Bluetooth
- [ ] HUD UI
- [ ] Web control interface
- [ ] APK build and testing
