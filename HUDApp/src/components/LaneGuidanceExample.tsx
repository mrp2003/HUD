/**
 * Lane Guidance Example
 *
 * Shows how to use LaneGuidance component with OSRM data
 * This demonstrates the complete integration flow
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react';
import {LaneGuidance, LaneData} from './LaneGuidance';
import {osrmService} from '../services/OSRMService';

export const LaneGuidanceExample: React.FC = () => {
  const [lanes, setLanes] = useState<LaneData[] | null>(null);
  const [distanceToTurn, setDistanceToTurn] = useState<number>(250);

  // Simulate approaching a turn
  useEffect(() => {
    // Example: Fetch route and extract lane data
    const fetchRoute = async () => {
      try {
        const route = await osrmService.getRoute(
          {latitude: 25.0800, longitude: 55.1700}, // Start
          {latitude: 25.2400, longitude: 55.2700}, // End (Sheikh Zayed Road)
        );

        // Get the current step (assuming we're on step 4 which has lane data)
        const currentStep = route.routes[0].legs[0].steps[4];

        // Extract lane data using OSRMService
        const laneData = osrmService.getLaneGuidance(
          currentStep,
          distanceToTurn,
        );

        if (laneData) {
          setLanes(laneData);
        }
      } catch (error) {
        console.error('Failed to fetch route:', error);
      }
    };

    fetchRoute();

    // Simulate distance decreasing (driver approaching turn)
    const interval = setInterval(() => {
      setDistanceToTurn(prev => {
        const newDistance = prev - 5; // Decrease by 5m per interval
        if (newDistance < 0) {
          return 300; // Reset for demo
        }
        return newDistance;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Example lane data (same as OSRM test)
  const exampleLanes: LaneData[] = [
    {valid: false, indications: ['straight']},
    {valid: true, indications: ['straight', 'right']}, // Can go straight OR right
    {valid: true, indications: ['right']},
    {valid: true, indications: ['right']},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Lane Guidance Demo</Text>
        <Text style={styles.distance}>{distanceToTurn}m to turn</Text>
      </View>

      {/* Use example data for demo */}
      <LaneGuidance lanes={exampleLanes} distanceToManeuver={distanceToTurn} />

      {/* Or use real OSRM data when available */}
      {/* {lanes && <LaneGuidance lanes={lanes} distanceToManeuver={distanceToTurn} />} */}

      <View style={styles.legend}>
        <Text style={styles.legendText}>
          White arrows = Recommended lanes
        </Text>
        <Text style={styles.legendText}>Gray arrows = Other lanes</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  distance: {
    color: '#888',
    fontSize: 18,
  },
  legend: {
    padding: 20,
    alignItems: 'center',
  },
  legendText: {
    color: '#888',
    fontSize: 14,
    marginVertical: 4,
  },
});

export default LaneGuidanceExample;
