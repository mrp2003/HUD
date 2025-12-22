import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface TimeRemainingProps {
  minutes: number;
}

const formatTime = (totalMinutes: number): {value: number; unit: string} => {
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    return {value: hours, unit: 'HRS'};
  }
  return {value: Math.round(totalMinutes), unit: 'MINS'};
};

export const TimeRemaining: React.FC<TimeRemainingProps> = ({minutes}) => {
  const {value, unit} = formatTime(minutes);

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
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
  time: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  unit: {
    fontSize: 28,
    color: '#FFFFFF',
    marginTop: -10,
  },
});
