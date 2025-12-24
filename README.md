# HUD - Custom Car Heads-Up Display

Open-source Android HUD app with lane-by-lane navigation guidance using OpenStreetMap and OSRM.

## Features

- 🚗 **Real-time speed display** from OBD2 Bluetooth
- 🧭 **Turn-by-turn navigation** with OSRM
- 🛣️ **Lane-by-lane guidance** showing which lanes to be in
- 📱 **Remote control** from iPhone via web interface
- 🔄 **Display flip mode** for windshield projection
- 🆓 **100% FREE** - No API costs, no limits

## Technology Stack

- **Frontend**: React Native 0.83.1 (TypeScript)
- **Routing**: OSRM (Open Source Routing Machine)
- **Map Data**: OpenStreetMap
- **Platform**: Android 9+ (Huawei MediaPad M5 2560x1600)
- **Build**: GitHub Actions (cloud APK builds)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/HUD.git
cd HUD/HUDApp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up OSRM Server

Follow the complete guide: [docs/OSRM_SETUP.md](docs/OSRM_SETUP.md)

Quick version:
```bash
# Download Dubai OSM data
wget http://download.geofabrik.de/asia/united-arab-emirates-latest.osm.pbf

# Run OSRM server with Docker
docker run -t -i -p 5000:5000 -v $(pwd):/data ghcr.io/project-osrm/osrm-backend osrm-routed --algorithm mld /data/united-arab-emirates-latest.osrm
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env
```

Set OSRM server URL:
```
OSRM_SERVER_URL=http://localhost:5000
```

### 5. Build APK

**Cloud build** (recommended):
```bash
git add .
git commit -m "Ready to build"
git push origin main
```

GitHub Actions will build APK automatically. Download from Actions tab.

**Local build**:
```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Project Structure

```
HUD/
├── HUDApp/                    # React Native app
│   ├── src/
│   │   ├── components/        # HUD UI components
│   │   ├── services/          # OSRM, OBD2 services
│   │   ├── config/            # Navigation config
│   │   └── screens/           # App screens
│   ├── android/               # Android native code
│   └── scripts/               # Utility scripts
├── docs/                      # Documentation
│   └── OSRM_SETUP.md         # OSRM setup guide
└── README.md                  # This file
```

## Lane Guidance Coverage

Based on Dubai testing (December 2024):

- **Sheikh Zayed Road**: 17.3% coverage ✅
- **Major highways**: Good coverage ✅
- **Residential areas**: Limited coverage ⚠️

**Graceful fallback**: HUD shows basic turn arrows when lane data unavailable.

## Development

### Test OSM Lane Coverage

```bash
cd HUDApp
node scripts/test-osm-lane-coverage.js
```

This tests lane data availability in Dubai areas.

### Run on Emulator

```bash
npm start
# In another terminal
npm run android
```

### Build Release APK

```bash
cd android
./gradlew assembleRelease
```

## Contributing

This is an open-source project. Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Roadmap

- [x] HUD interface design
- [x] OSRM integration
- [x] Lane guidance service
- [ ] Lane guidance UI component
- [ ] OBD2 Bluetooth integration
- [ ] Remote control web server
- [ ] Display flip mode
- [ ] Production testing

## License

MIT License - Free to use, modify, and distribute.

## Acknowledgments

- **OpenStreetMap** contributors for map data
- **OSRM** project for routing engine
- **React Native** community
- Dubai OSM mapping community

## Support

For issues or questions:
- Open an issue on GitHub
- Check [docs/OSRM_SETUP.md](docs/OSRM_SETUP.md) for setup help

---

**Built with ❤️ for safe driving**
