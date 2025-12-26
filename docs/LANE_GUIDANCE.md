# Lane Guidance Component Documentation

Complete guide to using the LaneGuidance component with OSRM data.

## Overview

The LaneGuidance component displays lane-by-lane guidance showing which lanes the driver should be in for upcoming maneuvers. It follows automotive HUD best practices for safety and clarity.

## Features

✅ **Ephemeral Display** - Only shows when 80-300m from turn
✅ **High Contrast** - White (valid) vs Dark gray (invalid)
✅ **Multiple Arrows** - Supports lanes with multiple indications (e.g., "straight OR right")
✅ **Spatial Fidelity** - Exact left-to-right lane order
✅ **Graceful Fallback** - Hides when no lane data available
✅ **Fade In/Out** - Smooth transitions based on distance

## Component API

```typescript
import {LaneGuidance, LaneData} from './components/LaneGuidance';

interface LaneData {
  indications: LaneIndication[]; // Arrow directions
  valid: boolean;                // Is lane recommended?
}

interface LaneGuidanceProps {
  lanes: LaneData[];
  distanceToManeuver?: number;   // Optional fade in/out
}
```

## Usage Example

### Basic Usage

```typescript
import {LaneGuidance} from './components';

const MyHUD = () => {
  const lanes = [
    {valid: false, indications: ['straight']},
    {valid: true, indications: ['straight', 'right']}, // Multi-indication
    {valid: true, indications: ['right']},
    {valid: true, indications: ['right']},
  ];

  return <LaneGuidance lanes={lanes} />;
};
```

### With OSRM Integration

```typescript
import {LaneGuidance} from './components';
import {osrmService} from './services/OSRMService';

const NavigationScreen = () => {
  const [lanes, setLanes] = useState(null);
  const [distanceToTurn, setDistanceToTurn] = useState(0);

  useEffect(() => {
    // Fetch route from OSRM
    const route = await osrmService.getRoute(origin, destination);

    // Get current step
    const currentStep = route.routes[0].legs[0].steps[currentStepIndex];

    // Extract lane guidance
    const laneData = osrmService.getLaneGuidance(
      currentStep,
      distanceToTurn,
    );

    setLanes(laneData);
  }, [currentStepIndex, distanceToTurn]);

  return (
    <View>
      {lanes && (
        <LaneGuidance
          lanes={lanes}
          distanceToManeuver={distanceToTurn}
        />
      )}
    </View>
  );
};
```

## Lane Indication Types

The component supports all OSRM lane indication types:

| Indication | Arrow | Description |
|------------|-------|-------------|
| `left` | ← | Left turn |
| `right` | → | Right turn |
| `straight` | ↑ | Go straight |
| `slight_left` | ↖ | Slight left |
| `slight_right` | ↗ | Slight right |
| `sharp_left` | ↰ | Sharp left |
| `sharp_right` | ↱ | Sharp right |
| `uturn` | ↶ | U-turn |
| `none` | • | No indication |

## Display Logic

### When to Show

```
Distance > 300m:  Hidden
300m → 80m:       Fade in (opacity increases)
< 80m:            Full opacity
After maneuver:   Hidden
```

### When to Hide

The component automatically hides when:
- No lane data available
- Less than 2 lanes
- Invalid data structure
- Distance > 300m

## Styling

### Colors (HUD Optimized)

```typescript
Valid lanes:   #FFFFFF (white)   - High visibility
Invalid lanes: #444444 (gray)    - Low priority
Background:    #000000 (black)   - HUD standard
```

### Sizing

```typescript
Arrow size:     72px   - Large for quick glance
Lane width:     60px   - Adequate spacing
Lane spacing:   16px   - Clear separation
```

## Example Lane Scenarios

### Scenario 1: Simple Right Turn

```typescript
[
  {valid: false, indications: ['straight']},
  {valid: true, indications: ['right']},
]
```

**Display:**
↑ (gray) → (white)

### Scenario 2: Lane with Multiple Options

```typescript
[
  {valid: false, indications: ['left']},
  {valid: true, indications: ['straight', 'right']},
  {valid: true, indications: ['right']},
]
```

**Display:**
← (gray) ↑→ (white) → (white)

### Scenario 3: Complex Intersection

```typescript
[
  {valid: false, indications: ['left']},
  {valid: false, indications: ['left', 'straight']},
  {valid: true, indications: ['straight']},
  {valid: true, indications: ['straight', 'right']},
  {valid: false, indications: ['right']},
]
```

**Display:**
← (gray) ←↑ (gray) ↑ (white) ↑→ (white) → (gray)

## Integration with HUD

### Recommended Layout

```
┌─────────────────────────────────┐
│ Speed: 80 km/h │ Next: Turn Right│
├─────────────────────────────────┤
│ Al Safa Street  │ 2 min remaining │
├─────────────────────────────────┤
│  Lane Guidance (250m from turn) │
│     ↑  ↑→  →  →                 │
│  (gray)(white)(white)(white)    │
└─────────────────────────────────┘
```

### Example Integration

```typescript
const HUDScreen = () => {
  return (
    <View style={styles.hudContainer}>
      <SpeedDisplay speed={currentSpeed} />
      <TurnInfo direction="right" streetName="Al Safa Street" />
      <TimeRemaining minutes={2} />

      {/* Lane guidance - ephemeral */}
      {lanes && distanceToTurn < 300 && (
        <LaneGuidance
          lanes={lanes}
          distanceToManeuver={distanceToTurn}
        />
      )}
    </View>
  );
};
```

## Testing

### Run Example Component

```bash
# See LaneGuidanceExample.tsx for interactive demo
import {LaneGuidanceExample} from './components';

const App = () => <LaneGuidanceExample />;
```

### Test Data

Use the example lanes from OSRM test:

```typescript
const testLanes = [
  {valid: false, indications: ['straight']},
  {valid: true, indications: ['straight', 'right']},
  {valid: true, indications: ['right']},
  {valid: true, indications: ['right']},
];
```

## Best Practices

1. **Always check for null** - Lane data may not be available
2. **Pass distance** - Enables automatic fade in/out
3. **Update frequently** - Recalculate every GPS update
4. **Hide after turn** - Reset lane data after maneuver completed
5. **Handle errors** - Gracefully fallback to basic turn arrows

## Performance

- **Minimal re-renders** - Only updates when lanes or distance change
- **No heavy computations** - Simple arrow symbol mapping
- **Auto-cleanup** - Returns null when not needed
- **React.memo candidate** - Can be memoized for optimization

## Accessibility

- **High contrast** - White on black for visibility
- **Large text** - 72px arrows readable at glance
- **Simple symbols** - Universal arrow meanings
- **No text dependency** - Works across languages

## Future Enhancements

- [ ] Audio cues ("Move to right lane")
- [ ] Haptic feedback on lane change
- [ ] Speed-based visibility (hide at very low speeds)
- [ ] Lane change animations
- [ ] Configurable colors/sizes

---

**Built for safe driving. Always prioritize road awareness over UI.**
