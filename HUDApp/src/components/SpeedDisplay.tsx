import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface SpeedDisplayProps {
  speed: number;
  speedLimit?: number;
  isOverLimit: boolean;
}

export const SpeedDisplay: React.FC<SpeedDisplayProps> = ({
  speed,
  isOverLimit,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.speed, isOverLimit && styles.speedWarning]}>
        {Math.round(speed)}
      </Text>
      <Text style={styles.unit}>KM/H</Text>
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
  speed: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  speedWarning: {
    color: '#FFA500', // Amber/Orange for over speed limit
  },
  unit: {
    fontSize: 28,
    color: '#FFFFFF',
    marginTop: -10,
  },
});
