/**
 * HERE Maps API Configuration
 *
 * Credentials are loaded from .env file
 * See .env.example for required variables
 */

import Config from 'react-native-config';

export const HERE_CONFIG = {
  // REST API credentials from .env
  APP_ID: Config.HERE_APP_ID || '',
  API_KEY: Config.HERE_API_KEY || '',

  // Native SDK credentials from .env
  SDK_ACCESS_KEY_ID: Config.HERE_SDK_ACCESS_KEY_ID || '',
  SDK_ACCESS_KEY_SECRET: Config.HERE_SDK_ACCESS_KEY_SECRET || '',

  // API Endpoints
  ROUTING_API: 'https://router.hereapi.com/v8/routes',
  GEOCODING_API: 'https://geocode.search.hereapi.com/v1',
  AUTOCOMPLETE_API: 'https://autocomplete.search.hereapi.com/v1/autocomplete',

  // Default location (Dubai)
  DEFAULT_LOCATION: {
    latitude: 25.2048,
    longitude: 55.2708,
  },

  // Routing preferences
  ROUTING_OPTIONS: {
    transportMode: 'car',
    return: 'polyline,summary,actions,instructions,turnByTurnActions',
    spans: 'maxSpeed,names,length',
    lang: 'en',
  },
};
