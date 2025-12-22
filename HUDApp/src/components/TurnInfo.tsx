import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {TurnDirection} from '../types/navigation';

interface TurnInfoProps {
  direction: TurnDirection;
  distance: number; // meters
  streetName: string;
}

const getTurnArrow = (direction: TurnDirection): string => {
  const arrows: Record<TurnDirection, string> = {
    left: '↰',
    right: '↱',
    straight: '↑',
    'slight-left': '↖',
    'slight-right': '↗',
    'sharp-left': '↰',
    'sharp-right': '↱',
    'u-turn': '↶',
  };
  return arrows[direction];
};

const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.round(meters)}m`;
};

export const TurnInfo: React.FC<TurnInfoProps> = ({
  direction,
  distance,
  streetName,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulsing when within 200m
    if (distance <= 200) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [distance, pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.turnRow}>
        <Animated.Text
          style={[
            styles.arrow,
            {
              transform: [{scale: pulseAnim}],
            },
          ]}>
          {getTurnArrow(direction)}
        </Animated.Text>
        <Text style={styles.distance}>{formatDistance(distance)}</Text>
      </View>
      <Text style={styles.streetName} numberOfLines={1}>
        {streetName}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#000',
  },
  turnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrow: {
    fontSize: 100,
    color: '#FFFFFF',
    marginRight: 15,
  },
  distance: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streetName: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
