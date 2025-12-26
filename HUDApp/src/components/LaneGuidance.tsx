/**
 * Lane Guidance Component
 *
 * Displays lane-by-lane guidance from OSRM data
 * Shows which lanes driver should be in for upcoming maneuver
 *
 * Following automotive HUD best practices:
 * - Ephemeral display (only show when 80-300m from turn)
 * - High contrast monochrome
 * - Large, clear arrows
 * - Spatial fidelity (exact left-to-right order)
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

// OSRM lane indication types
type LaneIndication =
  | 'left'
  | 'right'
  | 'straight'
  | 'slight_left'
  | 'slight_right'
  | 'sharp_left'
  | 'sharp_right'
  | 'uturn'
  | 'none';

export interface LaneData {
  indications: LaneIndication[]; // Can have multiple (e.g., ["straight", "right"])
  valid: boolean; // Is this lane valid for the current maneuver?
}

interface LaneGuidanceProps {
  lanes: LaneData[];
  distanceToManeuver?: number; // Optional: for fade in/out
}

/**
 * Get arrow symbol for lane indication
 */
const getArrowSymbol = (indication: LaneIndication): string => {
  switch (indication) {
    case 'left':
      return '←';
    case 'right':
      return '→';
    case 'straight':
      return '↑';
    case 'slight_left':
      return '↖';
    case 'slight_right':
      return '↗';
    case 'sharp_left':
      return '↰';
    case 'sharp_right':
      return '↱';
    case 'uturn':
      return '↶';
    case 'none':
      return '•';
    default:
      return '↑';
  }
};

/**
 * Render a single lane column with one or more arrow heads
 */
const LaneColumn: React.FC<{lane: LaneData; index: number}> = ({
  lane,
  index,
}) => {
  // Handle multiple indications (e.g., "straight OR right")
  const arrows = lane.indications.map(indication =>
    getArrowSymbol(indication),
  );

  return (
    <View style={styles.laneColumn} key={index}>
      <View style={styles.arrowContainer}>
        {arrows.map((arrow, i) => (
          <Text
            key={i}
            style={[
              styles.arrow,
              lane.valid ? styles.validLane : styles.invalidLane,
            ]}>
            {arrow}
          </Text>
        ))}
      </View>
    </View>
  );
};

/**
 * Main Lane Guidance Component
 */
export const LaneGuidance: React.FC<LaneGuidanceProps> = ({
  lanes,
  distanceToManeuver,
}) => {
  // Don't render if no lanes or insufficient lanes
  if (!lanes || lanes.length < 2) {
    return null;
  }

  // Validate data structure
  const hasValidData = lanes.every(
    lane => lane.valid !== undefined && Array.isArray(lane.indications),
  );

  if (!hasValidData) {
    return null;
  }

  // Calculate opacity based on distance (optional fade in/out)
  let opacity = 1;
  if (distanceToManeuver !== undefined) {
    if (distanceToManeuver > 300) {
      return null; // Don't show if too far
    } else if (distanceToManeuver > 80) {
      // Fade in from 300m to 80m
      opacity = (300 - distanceToManeuver) / 220;
    }
    // Full opacity below 80m
  }

  return (
    <View style={[styles.container, {opacity}]}>
      <View style={styles.lanesRow}>
        {lanes.map((lane, index) => (
          <LaneColumn key={index} lane={lane} index={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#000',
  },
  lanesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16, // Space between lanes
  },
  laneColumn: {
    minWidth: 60,
    alignItems: 'center',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrow: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  validLane: {
    color: '#FFFFFF', // White for recommended lanes
  },
  invalidLane: {
    color: '#444444', // Dark gray for non-recommended lanes
  },
});

export default LaneGuidance;
