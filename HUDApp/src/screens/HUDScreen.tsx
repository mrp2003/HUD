import React, {useEffect} from 'react';
import {View, StyleSheet, StatusBar, Text} from 'react-native';
import {SpeedDisplay} from '../components/SpeedDisplay';
import {TurnInfo} from '../components/TurnInfo';
import {TimeRemaining} from '../components/TimeRemaining';
import {LaneGuidance} from '../components/LaneGuidance';
import {useNavigation, mapManeuverToDirection} from '../hooks/useNavigation';
import {NAVIGATION_CONFIG} from '../config/navigation.config';

export const HUDScreen: React.FC = () => {
  const navigation = useNavigation();

  // Auto-start navigation to test destination on mount
  useEffect(() => {
    // Dubai Mall coordinates for testing
    const testDestination = {
      latitude: 25.1972,
      longitude: 55.2744,
    };

    // Start navigation after 2 seconds (give time for GPS)
    const timer = setTimeout(() => {
      navigation.startNavigation(testDestination);
    }, 2000);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate speed limit (placeholder - will be from OSRM or separate API later)
  const speedLimit = 80; // TODO: Get from OSRM tags or speed limit API

  const isOverSpeedLimit = navigation.currentSpeed > speedLimit;

  // Show error or loading state
  if (navigation.error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {navigation.error}</Text>
          <Text style={styles.errorSubtext}>Check GPS and OSRM server</Text>
        </View>
      </View>
    );
  }

  if (!navigation.isNavigating || !navigation.currentStep) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Starting navigation...</Text>
          <Text style={styles.loadingSubtext}>Getting GPS location</Text>
        </View>
      </View>
    );
  }

  // Extract turn info from current step
  const turnDirection = mapManeuverToDirection(
    navigation.currentStep.maneuver.type,
    navigation.currentStep.maneuver.modifier,
  );

  const streetName = navigation.currentStep.name || 'Unknown Road';
  const timeRemainingMinutes = Math.ceil(navigation.totalTimeRemaining / 60);

  return (
    <View style={styles.container}>

      {/* Top Row */}
      <View style={styles.topRow}>
        {/* Top Left - Speed (1/3 width) */}
        <View style={styles.leftColumn}>
          <SpeedDisplay
            speed={navigation.currentSpeed}
            speedLimit={speedLimit}
            isOverLimit={isOverSpeedLimit}
          />
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Top Right - Turn Info (2/3 width) */}
        <View style={styles.rightColumn}>
          <TurnInfo
            direction={turnDirection}
            distance={navigation.distanceToNextManeuver}
            streetName={streetName}
          />
        </View>
      </View>

      {/* Horizontal Divider */}
      <View style={styles.horizontalDivider} />

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        {/* Bottom Left - Time Remaining (1/3 width) */}
        <View style={styles.leftColumn}>
          <TimeRemaining minutes={timeRemainingMinutes} />
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Bottom Right - Lane Guidance (2/3 width) */}
        <View style={styles.rightColumn}>
          {navigation.lanes ? (
            <LaneGuidance
              lanes={navigation.lanes}
              distanceToManeuver={navigation.distanceToNextManeuver}
            />
          ) : (
            <View style={styles.noLanes}>
              <Text style={styles.noLanesText}>No lane data</Text>
            </View>
          )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFA500',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#888',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loadingSubtext: {
    color: '#888',
    fontSize: 16,
  },
  noLanes: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLanesText: {
    color: '#666',
    fontSize: 18,
  },
});
