# Navigation Integration Documentation

Complete guide to the integrated navigation system with OSRM and GPS tracking.

## Overview

The HUD app now features full navigation integration with:
- Real-time GPS tracking
- OSRM route calculation
- Distance-to-maneuver calculation
- Automatic step advancement
- Lane guidance integration
- Speed tracking (GPS now, OBD2 later)

## Architecture

```
┌─────────────────┐
│   HUDScreen     │ ← Main display component
└────────┬────────┘
         │
         ├─ useNavigation() hook
         │  ├─ GPS Tracking (Geolocation)
         │  ├─ OSRM Service
         │  ├─ Distance Calculation
         │  └─ State Management
         │
         ├─ SpeedDisplay (GPS/OBD2 speed)
         ├─ TurnInfo (next maneuver)
         ├─ TimeRemaining (route ETA)
         └─ LaneGuidance (ephemeral 80-300m)
```

## useNavigation Hook

Location: `HUDApp/src/hooks/useNavigation.ts`

### Key Features

1. **GPS Location Tracking**
   - Uses `@react-native-community/geolocation`
   - High accuracy mode (enableHighAccuracy: true)
   - Updates every 5 meters or 1 second
   - Converts GPS speed from m/s to km/h

2. **Route Management**
   - Fetches route from OSRM on navigation start
   - Tracks current step index
   - Auto-advances to next step within 20m of maneuver
   - Supports route recalculation

3. **Distance Calculation**
   - Haversine formula for lat/lng distance
   - Real-time distance to next maneuver
   - Total remaining distance and time

4. **Lane Guidance Integration**
   - Calls `osrmService.getLaneGuidance()` with current distance
   - Returns `null` when no lane data or outside 80-300m range
   - Supports graceful fallback

### API

```typescript
interface UseNavigationReturn {
  // State
  currentLocation: Coordinate | null;
  currentSpeed: number; // km/h
  route: Route | null;
  currentStepIndex: number;
  currentStep: RouteStep | null;
  distanceToNextManeuver: number; // meters
  totalDistanceRemaining: number; // meters
  totalTimeRemaining: number; // seconds
  lanes: LaneData[] | null;
  isNavigating: boolean;
  error: string | null;

  // Actions
  startNavigation: (destination: Coordinate) => Promise<void>;
  stopNavigation: () => void;
  recalculateRoute: () => Promise<void>;
}
```

### Usage Example

```typescript
import {useNavigation, mapManeuverToDirection} from '../hooks/useNavigation';

const MyComponent = () => {
  const nav = useNavigation();

  // Start navigation
  const destination = {
    latitude: 25.1972,
    longitude: 55.2744,
  };

  await nav.startNavigation(destination);

  // Access navigation state
  const speed = nav.currentSpeed; // km/h
  const distance = nav.distanceToNextManeuver; // meters
  const lanes = nav.lanes; // LaneData[] | null

  // Map OSRM maneuver to turn direction
  if (nav.currentStep) {
    const direction = mapManeuverToDirection(
      nav.currentStep.maneuver.type,
      nav.currentStep.maneuver.modifier,
    );
  }

  // Stop navigation
  nav.stopNavigation();
};
```

## HUDScreen Integration

Location: `HUDApp/src/screens/HUDScreen.tsx`

### Flow

1. **Component Mount**
   - Auto-starts navigation to test destination (Dubai Mall)
   - 2-second delay to allow GPS initialization

2. **Loading State**
   - Displays "Starting navigation..." while waiting for:
     - GPS lock
     - Route calculation
     - First location update

3. **Error State**
   - Shows error message if:
     - GPS unavailable
     - OSRM server unreachable
     - Route calculation fails

4. **Navigation State**
   - Displays all HUD components with real data:
     - Speed (from GPS, will be OBD2 later)
     - Turn info (direction, distance, street name)
     - Time remaining (from OSRM duration)
     - Lane guidance (when 80-300m from maneuver)

### State Mapping

```typescript
// OSRM → HUD Components
{
  currentSpeed → SpeedDisplay
  distanceToNextManeuver → TurnInfo
  currentStep.maneuver → TurnDirection
  currentStep.name → Street Name
  totalTimeRemaining → TimeRemaining
  lanes → LaneGuidance (conditional)
}
```

## GPS Configuration

### Android Permissions

Added to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### Geolocation Settings

```typescript
{
  enableHighAccuracy: true,  // Use GPS, not cell tower
  distanceFilter: 5,         // Update every 5 meters
  interval: 1000,            // Update every second
  fastestInterval: 500,      // Allow updates every 500ms
}
```

### Runtime Permissions

**Required for Android 6.0+:**
User must grant location permissions at runtime. The app requests these automatically when Geolocation is first accessed.

## Distance Calculation

### Haversine Formula

Calculates great-circle distance between two lat/lng coordinates:

```typescript
function calculateDistance(
  coord1: Coordinate,
  coord2: Coordinate,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
```

**Accuracy:** ~0.5% error for typical navigation distances (<50km)

## Maneuver Type Mapping

OSRM provides maneuver types and modifiers. We map these to TurnDirection:

```typescript
mapManeuverToDirection(type, modifier):
  'uturn' → 'u-turn'
  'sharp left' → 'sharp-left'
  'sharp right' → 'sharp-right'
  'slight left' → 'slight-left'
  'slight right' → 'slight-right'
  'left' → 'left'
  'right' → 'right'
  default → 'straight'
```

### OSRM Maneuver Types

| Type | Description |
|------|-------------|
| depart | Start of route |
| arrive | End of route |
| turn | Standard turn |
| new name | Street name change (continue) |
| merge | Highway merge |
| on ramp | Enter highway |
| off ramp | Exit highway |
| fork | Road splits |
| roundabout | Enter roundabout |
| rotary | Enter rotary |

## Step Auto-Advancement

The hook automatically advances to the next step when:
- Distance to current maneuver < 20 meters
- Not on the last step

```typescript
if (distanceToManeuver < 20 && currentStepIndex < route.legs[0].steps.length - 1) {
  setState(prev => ({
    ...prev,
    currentStepIndex: prev.currentStepIndex + 1,
  }));
}
```

## Lane Guidance Visibility

Lane guidance is shown only when:
1. Distance 80-300m from maneuver
2. Current step has lane data (`intersection.lanes`)
3. At least 2 lanes present
4. Lane data is valid (`valid` property exists)

```typescript
const laneGuidance = osrmService.getLaneGuidance(
  currentStep,
  distanceToManeuver,
);

// Returns null if:
// - distanceToManeuver > 300m
// - distanceToManeuver < 80m
// - No lane data available
// - Less than 2 lanes
```

## Speed Tracking

### Current: GPS Speed

```typescript
const gpsSpeed = position.coords.speed
  ? (position.coords.speed * 3.6) // Convert m/s to km/h
  : 0;
```

**Limitations:**
- Less accurate at low speeds
- May be 0 when stationary
- Subject to GPS accuracy variations

### Future: OBD2 Speed

Will replace GPS speed with real-time OBD2 data:
- More accurate, especially at low speeds
- Direct from vehicle ECU
- Updated at higher frequency

## Testing

### Prerequisites

1. **OSRM Server Running**
   ```bash
   docker run -t -i -p 5000:5000 -v $(pwd):/data ghcr.io/project-osrm/osrm-backend osrm-routed --algorithm mld /data/gcc-states-latest.osrm
   ```

2. **GPS Available**
   - Real device with GPS enabled
   - Or Android emulator with location mocking

3. **Location Permissions**
   - Grant when prompted

### Test Flow

1. **Launch App**
   - App auto-starts navigation to Dubai Mall after 2 seconds

2. **Wait for GPS Lock**
   - "Starting navigation..." screen shows while acquiring GPS

3. **Navigation Begins**
   - Speed displays current GPS speed
   - Turn info shows next maneuver
   - Distance updates in real-time

4. **Lane Guidance Appears**
   - Only when 80-300m from turn with lane data
   - White arrows = valid lanes
   - Gray arrows = other lanes

5. **Step Advancement**
   - Automatically advances at each maneuver
   - New turn info displayed

### Mock Location Testing

For Android Emulator:
```bash
# Set location via ADB
adb emu geo fix 55.2708 25.2048

# Simulate route movement
# (Use a script to incrementally change coordinates)
```

## Error Handling

### GPS Errors

```typescript
if (error) {
  setState(prev => ({
    ...prev,
    error: 'GPS tracking failed',
  }));
}
```

**Causes:**
- GPS disabled
- No GPS signal
- Permission denied

### OSRM Errors

```typescript
if (!routeResponse.routes || routeResponse.routes.length === 0) {
  throw new Error('No route found');
}
```

**Causes:**
- OSRM server not running
- Invalid coordinates
- No route available between points

### Display

Error state shows:
- Error message
- Troubleshooting hint ("Check GPS and OSRM server")

## Performance

### GPS Updates

- **Location updates:** Every 5m or 1s (whichever comes first)
- **Distance calculation:** O(1) - Haversine formula
- **State updates:** Optimized with useEffect dependencies

### Memory

- Route data: ~50KB for typical 20km route
- GPS watch: Single listener, cleaned up on unmount
- No memory leaks: All refs cleared on stopNavigation()

## Future Enhancements

### OBD2 Integration
- [ ] Replace GPS speed with OBD2 speed (PIDs 0x0D, 0x0C)
- [ ] Add RPM display
- [ ] Engine temperature warning

### Navigation Features
- [ ] Voice guidance ("In 200 meters, turn right")
- [ ] Route recalculation on deviation
- [ ] Traffic integration (if data source available)
- [ ] Multi-stop waypoints

### UI Enhancements
- [ ] Compass heading
- [ ] Speed limit from OSM or API
- [ ] Arrival time prediction
- [ ] Night mode (lower brightness)

---

**Built for real-world navigation. Keep eyes on the road.**
