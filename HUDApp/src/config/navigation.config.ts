/**
 * Navigation Configuration
 *
 * OSRM-based navigation with OpenStreetMap data
 */

import Config from 'react-native-config';

export const NAVIGATION_CONFIG = {
  // OSRM Server
  OSRM_SERVER_URL: Config.OSRM_SERVER_URL || 'http://localhost:5000',

  // Default location (Dubai)
  DEFAULT_LOCATION: {
    latitude: 25.2048,
    longitude: 55.2708,
  },

  // Lane guidance display settings
  LANE_GUIDANCE: {
    // Show lane bar when within this distance (meters)
    SHOW_DISTANCE_MAX: 300,
    SHOW_DISTANCE_MIN: 80,
    // Hide after maneuver completed
    HIDE_AFTER_MANEUVER: true,
  },

  // Routing preferences
  ROUTING_OPTIONS: {
    profile: 'car', // car, bike, foot
    steps: true,    // Required for lane data
    overview: 'full',
    geometries: 'geojson',
    annotations: true,
  },
};
