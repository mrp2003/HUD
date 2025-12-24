# HERE Native SDK Lane Guidance Setup

## What This Gives You

**Real lane-by-lane guidance:**
```javascript
{
  lanes: [
    { directions: ['left'], recommended: false },
    { directions: ['left', 'straight'], recommended: true },  // ← Driver should be here
    { directions: ['straight'], recommended: true },           // ← Or here
    { directions: ['straight', 'right'], recommended: false },
    { directions: ['right'], recommended: false }
  ],
  distanceToManeuver: 250  // 250 meters until turn
}
```

## Step 1: Get HERE SDK Credentials

1. Go to https://developer.here.com
2. Navigate to: **Projects > Your Project > Credentials**
3. Click **"Generate SDK credentials"**
4. Copy:
   - **Access Key ID**
   - **Access Key Secret**

## Step 2: Add Credentials to .env

```bash
# Open .env file
nano HUDApp/.env
```

Add your SDK credentials:
```
HERE_SDK_ACCESS_KEY_ID=your_actual_key_id
HERE_SDK_ACCESS_KEY_SECRET=your_actual_key_secret
```

## Step 3: Usage in React Native

### Initialize SDK (once at app start)

```typescript
import {hereLaneGuidanceService} from './services/HereLaneGuidanceNative';
import {HERE_CONFIG} from './config/here.config';

// Initialize HERE SDK
await hereLaneGuidanceService.initialize(
  HERE_CONFIG.SDK_ACCESS_KEY_ID,
  HERE_CONFIG.SDK_ACCESS_KEY_SECRET,
);
```

### Start Navigation

```typescript
// Start navigation to destination
await hereLaneGuidanceService.startNavigation(
  { lat: 25.2048, lng: 55.2708 },  // Current location
  { lat: 25.1972, lng: 55.2744 },  // Destination
);
```

### Listen for Lane Guidance Updates

```typescript
// This fires automatically as you drive
hereLaneGuidanceService.onLaneGuidanceUpdated((event) => {
  console.log('Lanes:', event.lanes);
  console.log('Distance to turn:', event.distanceToManeuver);

  // Update your HUD display with lane data
  updateLaneDisplay(event.lanes);
});
```

### Update Location (GPS)

```typescript
// Call this repeatedly with GPS updates (every 1-2 seconds)
hereLaneGuidanceService.updateLocation(
  25.2048,  // latitude
  55.2708,  // longitude
  80,       // speed in m/s
  45,       // bearing in degrees
);
```

### Stop Navigation

```typescript
hereLaneGuidanceService.stopNavigation();
hereLaneGuidanceService.removeListener();
```

## Architecture

```
┌─────────────────────────────────────┐
│   React Native (JavaScript)         │
│   - HUD Components                  │
│   - Lane Display                    │
│   - Navigation State                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   TypeScript Bridge                 │
│   HereLaneGuidanceNative.ts         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Native Android Module (Java)      │
│   HereLaneGuidanceModule.java       │
│   - HERE SDK Integration            │
│   - VisualNavigator                 │
│   - Lane Assistance Listener        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   HERE SDK Native (Android)         │
│   - Real lane-by-lane data          │
│   - Turn-by-turn guidance           │
│   - Route calculation               │
└─────────────────────────────────────┘
```

## Files Created

### Native Android
- `android/app/src/main/java/com/hudapp/HereLaneGuidanceModule.java` - Native module
- `android/app/src/main/java/com/hudapp/HereLaneGuidancePackage.java` - Package registration
- `android/app/build.gradle` - HERE SDK dependency added

### React Native Bridge
- `src/services/HereLaneGuidanceNative.ts` - TypeScript wrapper

### Configuration
- `.env` - SDK credentials (gitignored)
- `src/config/here.config.ts` - Configuration exports

## Build

No Android Studio needed! Build with:

```bash
# Local build
cd android
./gradlew assembleRelease

# Or push to GitHub for cloud build
git push origin main
```

## Data Usage

- **Lane guidance**: 0 MB (processed on-device by native SDK)
- **Route calculation**: ~30 KB per route (same as before)
- **Total yearly**: ~25 MB (same as REST API only)

## Lane Guidance Event Flow

```
1. User starts navigation
2. GPS updates location every 1-2 seconds
3. Native SDK processes location against route
4. When approaching a turn:
   → Lane guidance event fires
   → Shows which lanes to be in
   → Updates every few seconds as you approach
5. Display lanes on HUD with recommended lanes highlighted
```

## Troubleshooting

**"SDK not initialized" error:**
- Make sure you called `initializeSDK()` before starting navigation
- Check that SDK credentials are correctly set in .env

**No lane guidance events:**
- Lane data might not be available for all roads
- Make sure you're calling `updateLocation()` regularly
- Check that you're subscribed to lane guidance events

**Build fails:**
- Run `cd android && ./gradlew clean`
- Check that HERE SDK dependency is in build.gradle
- Verify Java version is 17+

## Next Steps

1. Get SDK credentials from HERE portal
2. Add to .env file
3. Build APK (GitHub Actions or local)
4. Test with real navigation
5. Integrate with HUD lane display component
