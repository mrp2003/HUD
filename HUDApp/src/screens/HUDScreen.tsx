import React, {useState, useEffect} from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import {SpeedDisplay} from '../components/SpeedDisplay';
import {TurnInfo} from '../components/TurnInfo';
import {TimeRemaining} from '../components/TimeRemaining';
import {LaneGuidance} from '../components/LaneGuidance';
import {NavigationData} from '../types/navigation';

export const HUDScreen: React.FC = () => {
  // Mock data for testing - will be replaced with real data from navigation API and OBD2
  const [navData, setNavData] = useState<NavigationData>({
    currentSpeed: 72,
    speedLimit: 80,
    nextTurnDirection: 'left',
    nextTurnDistance: 120,
    nextTurnStreetName: 'Sheikh Zayed Road',
    timeRemaining: 25,
    lanes: [
      {directions: ['left'], active: true},
      {directions: ['straight'], active: false},
      {directions: ['straight'], active: false},
      {directions: ['straight'], active: false},
      {directions: ['right'], active: false},
    ],
  });

  const isOverSpeedLimit =
    navData.speedLimit !== undefined &&
    navData.currentSpeed > navData.speedLimit;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Top Row */}
      <View style={styles.topRow}>
        {/* Top Left - Speed (1/3 width) */}
        <View style={styles.leftColumn}>
          <SpeedDisplay
            speed={navData.currentSpeed}
            speedLimit={navData.speedLimit}
            isOverLimit={isOverSpeedLimit}
          />
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Top Right - Turn Info (2/3 width) */}
        <View style={styles.rightColumn}>
          <TurnInfo
            direction={navData.nextTurnDirection}
            distance={navData.nextTurnDistance}
            streetName={navData.nextTurnStreetName}
          />
        </View>
      </View>

      {/* Horizontal Divider */}
      <View style={styles.horizontalDivider} />

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        {/* Bottom Left - Time Remaining (1/3 width) */}
        <View style={styles.leftColumn}>
          <TimeRemaining minutes={navData.timeRemaining} />
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Bottom Right - Lane Guidance (2/3 width) */}
        <View style={styles.rightColumn}>
          <LaneGuidance lanes={navData.lanes} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topRow: {
    flex: 1,
    flexDirection: 'row',
  },
  bottomRow: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1, // 1/3 of width
  },
  rightColumn: {
    flex: 2, // 2/3 of width
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#333333',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#333333',
  },
});
