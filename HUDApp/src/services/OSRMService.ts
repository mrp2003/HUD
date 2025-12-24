/**
 * OSRM Service
 *
 * Handles routing and lane guidance using OSRM (Open Source Routing Machine)
 * with OpenStreetMap data.
 */

import {NAVIGATION_CONFIG} from '../config/navigation.config';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface LaneIndication {
  indications: string[]; // ['left', 'straight', 'right', etc.]
  valid: boolean; // Is this lane valid for the current maneuver?
}

export interface Intersection {
  location: [number, number]; // [longitude, latitude]
  lanes?: LaneIndication[];
  bearings: number[];
  entry: boolean[];
  in?: number;
  out?: number;
}

export interface RouteStep {
  distance: number;
  duration: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
  intersections: Intersection[];
}

export interface Route {
  distance: number;
  duration: number;
  legs: Array<{
    distance: number;
    duration: number;
    steps: RouteStep[];
  }>;
  geometry: {
    coordinates: Array<[number, number]>;
    type: string;
  };
}

export interface OSRMRouteResponse {
  code: string;
  routes: Route[];
  waypoints: Array<{
    location: [number, number];
    name: string;
  }>;
}

class OSRMService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = NAVIGATION_CONFIG.OSRM_SERVER_URL;
  }

  /**
   * Get route from origin to destination
   */
  async getRoute(
    origin: Coordinate,
    destination: Coordinate,
  ): Promise<OSRMRouteResponse> {
    const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const options = NAVIGATION_CONFIG.ROUTING_OPTIONS;

    const url = `${this.baseUrl}/route/v1/${options.profile}/${coords}?steps=${options.steps}&overview=${options.overview}&geometries=${options.geometries}&annotations=${options.annotations}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }

      const data: OSRMRouteResponse = await response.json();

      if (data.code !== 'Ok') {
        throw new Error(`OSRM routing failed: ${data.code}`);
      }

      return data;
    } catch (error) {
      console.error('OSRM getRoute error:', error);
      throw error;
    }
  }

  /**
   * Get lane guidance for upcoming maneuver
   * Returns null if no lane data available
   */
  getLaneGuidance(
    currentStep: RouteStep,
    distanceToManeuver: number,
  ): LaneIndication[] | null {
    const {SHOW_DISTANCE_MAX, SHOW_DISTANCE_MIN} = NAVIGATION_CONFIG.LANE_GUIDANCE;

    // Only show lane guidance when close to maneuver
    if (
      distanceToManeuver > SHOW_DISTANCE_MAX ||
      distanceToManeuver < SHOW_DISTANCE_MIN
    ) {
      return null;
    }

    // Get first intersection (where the maneuver happens)
    const intersection = currentStep.intersections[0];

    // Check if lane data exists and is valid
    if (
      !intersection?.lanes ||
      intersection.lanes.length < 2 ||
      !intersection.lanes.every(lane => lane.valid !== undefined)
    ) {
      return null;
    }

    return intersection.lanes;
  }

  /**
   * Extract turn instruction from maneuver
   */
  getTurnInstruction(step: RouteStep): string {
    const {type, modifier} = step.maneuver;

    if (type === 'depart') return 'Start';
    if (type === 'arrive') return 'Arrive';
    if (type === 'turn' && modifier) return `Turn ${modifier}`;
    if (type === 'new name') return 'Continue';
    if (type === 'merge') return `Merge ${modifier || ''}`;
    if (type === 'on ramp') return 'Take ramp';
    if (type === 'off ramp') return 'Exit';
    if (type === 'fork' && modifier) return `Fork ${modifier}`;
    if (type === 'end of road' && modifier) return `At end, turn ${modifier}`;
    if (type === 'roundabout') return 'Enter roundabout';
    if (type === 'rotary') return 'Enter rotary';

    return 'Continue';
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}

export const osrmService = new OSRMService();
