/**
 * HERE Maps API Service
 * Handles all HERE API interactions: routing, geocoding, and tiles
 */

import {HERE_CONFIG} from '../config/here.config';
import type {NavigationData, TurnDirection, Lane} from '../types/navigation';

export interface RouteRequest {
  origin: {lat: number; lng: number};
  destination: {lat: number; lng: number};
}

export interface RouteResponse {
  routes: Array<{
    sections: Array<{
      polyline: string;
      summary: {
        length: number; // meters
        duration: number; // seconds
      };
      actions: Array<{
        action: string;
        direction: string;
        distance: number;
        instruction: string;
      }>;
      spans: Array<{
        offset: number;
        speedLimit?: number; // meters/sec
        names?: Array<{value: string}>;
        length?: number;
      }>;
    }>;
  }>;
}

export interface GeocodingResult {
  title: string;
  address: {
    label: string;
    city?: string;
    street?: string;
  };
  position: {
    lat: number;
    lng: number;
  };
}

class HereApiService {
  private apiKey: string;

  constructor() {
    this.apiKey = HERE_CONFIG.API_KEY;
  }

  /**
   * Calculate route from origin to destination
   */
  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    const {origin, destination} = request;
    const url = new URL(HERE_CONFIG.ROUTING_API);

    url.searchParams.append('apiKey', this.apiKey);
    url.searchParams.append('origin', `${origin.lat},${origin.lng}`);
    url.searchParams.append(
      'destination',
      `${destination.lat},${destination.lng}`,
    );
    url.searchParams.append(
      'transportMode',
      HERE_CONFIG.ROUTING_OPTIONS.transportMode,
    );
    url.searchParams.append('return', HERE_CONFIG.ROUTING_OPTIONS.return);
    url.searchParams.append('spans', HERE_CONFIG.ROUTING_OPTIONS.spans);
    url.searchParams.append('lang', HERE_CONFIG.ROUTING_OPTIONS.lang);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Routing API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search for locations by query string
   */
  async geocode(query: string): Promise<GeocodingResult[]> {
    const url = new URL(`${HERE_CONFIG.GEOCODING_API}/geocode`);

    url.searchParams.append('apiKey', this.apiKey);
    url.searchParams.append('q', query);
    url.searchParams.append('in', 'countryCode:ARE'); // UAE only

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * Get autocomplete suggestions for search
   */
  async autocomplete(query: string): Promise<GeocodingResult[]> {
    const url = new URL(HERE_CONFIG.AUTOCOMPLETE_API);

    url.searchParams.append('apiKey', this.apiKey);
    url.searchParams.append('q', query);
    url.searchParams.append('in', 'countryCode:ARE');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Autocomplete API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * Convert HERE routing response to NavigationData for HUD
   */
  parseRouteToNavigationData(
    route: RouteResponse,
    currentSpeed: number,
  ): NavigationData {
    const section = route.routes[0]?.sections[0];
    if (!section) {
      throw new Error('No route sections found');
    }

    const nextAction = section.actions[0];
    const nextSpan = section.spans[0];

    return {
      currentSpeed,
      speedLimit: nextSpan?.speedLimit
        ? Math.round(nextSpan.speedLimit * 3.6)
        : undefined, // Convert m/s to km/h
      nextTurnDirection: this.mapTurnDirection(nextAction.direction),
      nextTurnDistance: nextAction.distance,
      nextTurnStreetName:
        nextSpan?.names?.[0]?.value || nextAction.instruction,
      timeRemaining: Math.round(section.summary.duration / 60), // Convert to minutes
      lanes: this.parseLanes(nextAction),
    };
  }

  /**
   * Map HERE turn direction to HUD turn direction
   */
  private mapTurnDirection(direction: string): TurnDirection {
    const directionMap: Record<string, TurnDirection> = {
      left: 'left',
      right: 'right',
      straight: 'straight',
      slightLeft: 'slight-left',
      slightRight: 'slight-right',
      sharpLeft: 'sharp-left',
      sharpRight: 'sharp-right',
      uTurnLeft: 'u-turn',
      uTurnRight: 'u-turn',
    };

    return directionMap[direction] || 'straight';
  }

  /**
   * Parse lane guidance from action
   * TODO: Implement proper lane parsing when lane data is available
   */
  private parseLanes(action: any): Lane[] {
    // Placeholder: Return empty lanes array
    // Real implementation would parse action.laneGuidance when available
    return [];
  }

  /**
   * Get vector tile URL for MapLibre
   */
  getVectorTileUrl(): string {
    return `${HERE_CONFIG.VECTOR_TILE_API}/{z}/{x}/{y}/omv?apiKey=${this.apiKey}`;
  }
}

export const hereApiService = new HereApiService();
