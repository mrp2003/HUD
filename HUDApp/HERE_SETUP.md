# HERE Maps Integration Setup

## Step 1: Get HERE API Key

1. Go to https://developer.here.com/sign-up
2. Sign up for a free account
3. Create a new project
4. Generate an API key with these permissions:
   - ✅ Routing API (v8)
   - ✅ Vector Tile API
   - ✅ Geocoding & Search API

## Step 2: Configure API Key

1. Open `src/config/here.config.ts`
2. Replace `YOUR_HERE_API_KEY` with your actual API key:
   ```typescript
   API_KEY: 'your-actual-api-key-here',
   ```

## Step 3: Install Dependencies

```bash
cd HUDApp
npm install
```

New packages installed:
- `@maplibre/maplibre-react-native` - Map rendering
- `@react-native-async-storage/async-storage` - Data caching
- `react-native-fs` - File system for tile storage

## Step 4: Link Native Modules

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## Architecture Overview

```
HUDApp/
├── src/
│   ├── config/
│   │   └── here.config.ts          # API configuration
│   ├── services/
│   │   ├── HereApiService.ts       # Routing, geocoding, tiles
│   │   └── TileCacheService.ts     # Offline tile management
│   ├── hooks/
│   │   └── useNavigation.ts        # Navigation state
│   ├── components/
│   │   ├── MapView.tsx             # MapLibre wrapper
│   │   ├── SpeedDisplay.tsx        # HUD speed
│   │   ├── TurnInfo.tsx            # HUD turn arrows
│   │   ├── TimeRemaining.tsx       # HUD time
│   │   └── LaneGuidance.tsx        # HUD lanes
│   └── screens/
│       └── HUDScreen.tsx           # Main screen
```

## Usage Example

### Start Navigation
```typescript
import {useNavigation} from './hooks/useNavigation';

const {startNavigation, navigationData} = useNavigation();

// Start navigation to destination
await startNavigation({
  lat: 25.2048,
  lng: 55.2708,
});

// navigationData contains:
// - currentSpeed
// - speedLimit
// - nextTurnDirection
// - nextTurnDistance
// - nextTurnStreetName
// - timeRemaining
// - lanes
```

### Download Offline Tiles
```typescript
import {tileCacheService} from './services/TileCacheService';

// Download UAE/Dubai region tiles (do this on WiFi!)
await tileCacheService.downloadRegionTiles((progress) => {
  console.log(`Downloaded ${progress.percentComplete}%`);
});

// Check cache status
const stats = await tileCacheService.getCacheStats();
console.log(`Cache size: ${stats.cacheSizeMB} MB`);
```

## Data Usage

- **One-time download**: ~350 MB (UAE map tiles on WiFi)
- **Per route calculation**: ~30 KB
- **Monthly usage**: ~2 MB (60 routes/month)
- **Yearly usage**: ~25 MB

## Next Steps

1. Get API key and update config
2. Test basic routing with mock location
3. Download offline tiles (on WiFi)
4. Integrate with OBD2 for real speed
5. Test in car with real navigation
