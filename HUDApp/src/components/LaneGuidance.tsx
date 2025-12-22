import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Lane, LaneDirection} from '../types/navigation';

interface LaneGuidanceProps {
  lanes: Lane[];
}

const getLaneArrow = (directions: LaneDirection[]): string => {
  // If multiple directions, prioritize based on most common pattern
  if (directions.includes('left')) return '↰';
  if (directions.includes('slight-left')) return '↖';
  if (directions.includes('right')) return '↱';
  if (directions.includes('slight-right')) return '↗';
  return '↑'; // straight
};

export const LaneGuidance: React.FC<LaneGuidanceProps> = ({lanes}) => {
  return (
    <View style={styles.container}>
      <View style={styles.lanesRow}>
        {lanes.map((lane, index) => (
          <View key={index} style={styles.laneContainer}>
            <Text
              style={[
                styles.laneArrow,
                lane.active ? styles.activeLane : styles.inactiveLane,
              ]}>
              {getLaneArrow(lane.directions)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  lanesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  laneContainer: {
    marginHorizontal: 12,
  },
  laneArrow: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  activeLane: {
    color: '#FF0000', // Red for active lane (change to #00FF00 green if visibility issues)
  },
  inactiveLane: {
    color: '#666666', // Gray for inactive lanes
  },
});
