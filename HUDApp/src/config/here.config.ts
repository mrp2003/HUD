/**
 * HERE Maps API Configuration
 *
 * Credentials are loaded from .env file
 * See .env.example for required variables
 */

import Config from 'react-native-config';

export const HERE_CONFIG = {
  // API credentials from .env
  APP_ID: Config.HERE_APP_ID || '',
  API_KEY: Config.HERE_API_KEY || '',

  // API Endpoints
  ROUTING_API: 'https://router.hereapi.com/v8/routes',
  GEOCODING_API: 'https://geocode.search.hereapi.com/v1',
  AUTOCOMPLETE_API: 'https://autocomplete.search.hereapi.com/v1/autocomplete',
  VECTOR_TILE_API: 'https://vector.hereapi.com/v2/vectortiles/core/mc',

  // Map configuration for UAE/Dubai region
  DEFAULT_REGION: {
    latitude: 25.2048, // Dubai coordinates
    longitude: 55.2708,
    zoom: 12,
  },

  // Tile caching settings
  CACHE_SETTINGS: {
    // UAE bounding box for offline tiles
    boundingBox: {
      north: 26.0,
      south: 22.5,
      east: 56.5,
      west: 51.5,
    },
    // Zoom levels to cache (8-16 recommended for navigation)
    zoomLevels: [8, 9, 10, 11, 12, 13, 14, 15, 16],
    maxCacheSizeMB: 800, // ~800MB for UAE region
  },

  // Routing preferences
  ROUTING_OPTIONS: {
    transportMode: 'car',
    return: 'polyline,summary,actions,instructions,turnByTurnActions',
    spans: 'maxSpeed,names,length',
    lang: 'en',
  },
};
