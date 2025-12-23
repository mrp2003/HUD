# Custom Car HUD App

A minimalist heads-up display app for Android tablets that provides:
- Simplified turn-by-turn navigation with lane guidance
- Real-time speed display via OBD2 Bluetooth connection
- Offline maps support
- Remote control via web interface (accessible from iPhone)
- Windshield reflection mode

## Architecture

- **Display App**: Android tablet app (React Native + TypeScript)
- **Remote Control**: Web interface accessible via local network
- **Navigation**: HERE Maps API v8 (routing) + MapLibre (rendering)
- **Offline Maps**: HERE Vector Tiles cached locally
- **Speed Data**: OBD2 Bluetooth connection (ELM327)
- **Connectivity**: WiFi Direct for phone-to-tablet control

## Tech Stack

- **Frontend**: React Native 0.83.1 with TypeScript
- **Maps**: MapLibre GL Native + HERE Vector Tiles
- **Navigation**: HERE Routing API v8 (20-30 MB/year data usage)
- **Offline Tiles**: ~350 MB one-time download for UAE region
- **OBD2**: Bluetooth Low Energy (react-native-ble-plx)
- **Web Server**: Express.js (local control interface)

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

- [x] Android SDK setup (command-line only)
- [x] React Native project initialization
- [x] HUD UI design and implementation
- [x] GitHub Actions for cloud APK building
- [x] Initial APK build and tablet testing
- [x] HERE Maps integration architecture
- [ ] HERE API key configuration
- [ ] Navigation implementation (HERE + MapLibre)
- [ ] Offline tile download (UAE/Dubai region)
- [ ] OBD2 Bluetooth connection
- [ ] Web control interface
- [ ] Display flip mode

## Project Structure

```
HUD/
├── HUDApp/                        # React Native application
│   ├── src/
│   │   ├── components/            # HUD UI components
│   │   │   ├── SpeedDisplay.tsx   # Speed + limit warning
│   │   │   ├── TurnInfo.tsx       # Turn arrows + street
│   │   │   ├── TimeRemaining.tsx  # ETA display
│   │   │   ├── LaneGuidance.tsx   # Lane arrows
│   │   │   └── MapView.tsx        # MapLibre map
│   │   ├── screens/
│   │   │   └── HUDScreen.tsx      # Main HUD layout
│   │   ├── services/
│   │   │   ├── HereApiService.ts  # HERE API client
│   │   │   └── TileCacheService.ts # Offline tiles
│   │   ├── hooks/
│   │   │   └── useNavigation.ts   # Navigation state
│   │   ├── config/
│   │   │   └── here.config.ts     # API configuration
│   │   └── types/
│   │       └── navigation.ts      # TypeScript types
│   ├── android/                   # Android native code
│   ├── App.tsx                    # Main app entry
│   ├── package.json               # Dependencies
│   └── HERE_SETUP.md              # Setup guide
├── .github/workflows/
│   └── build-apk.yml              # Cloud APK building
├── android-env.sh                 # Environment config
└── README.md                      # This file
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

### 3. HERE Maps Setup

See [HERE_SETUP.md](HUDApp/HERE_SETUP.md) for detailed instructions.

Quick start:
1. Get API key from https://developer.here.com
2. Update `HUDApp/src/config/here.config.ts` with your key
3. Run `npm install` in HUDApp directory

### 4. Building APK

**Option 1: GitHub Actions (Recommended)**
- Push changes to GitHub
- Actions will build APK automatically
- Download from Actions artifacts

**Option 2: Local Build**
```bash
cd HUDApp/android
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

## Data Usage

With HERE Maps navigation:
- **One-time**: 350 MB (offline tiles on WiFi)
- **Monthly**: ~2 MB (routing API calls)
- **Yearly**: ~25 MB total
- **Percentage**: 0.1% of 2GB monthly data plan
