/**
 * useNavigation Hook
 *
 * Manages navigation state with OSRM integration
 * Handles GPS tracking, distance calculation, and route updates
 */

import {useState, useEffect, useRef} from 'react';
import Geolocation from '@react-native-community/geolocation';
import {osrmService, Coordinate, RouteStep, Route} from '../services/OSRMService';
import {LaneData} from '../components/LaneGuidance';

interface NavigationState {
  currentLocation: Coordinate | null;
  currentSpeed: number; // km/h - will be from OBD2 later
  route: Route | null;
  currentStepIndex: number;
  currentStep: RouteStep | null;
  distanceToNextManeuver: number; // meters
  totalDistanceRemaining: number; // meters
  totalTimeRemaining: number; // seconds
  lanes: LaneData[] | null;
  isNavigating: boolean;
  error: string | null;
}

interface UseNavigationReturn extends NavigationState {
  startNavigation: (destination: Coordinate) => Promise<void>;
  stopNavigation: () => void;
  recalculateRoute: () => Promise<void>;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  coord1: Coordinate,
  coord2: Coordinate,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Map OSRM maneuver types to turn directions
 */
export function mapManeuverToDirection(
  maneuverType: string,
  modifier?: string,
): 'left' | 'right' | 'straight' | 'slight-left' | 'slight-right' | 'sharp-left' | 'sharp-right' | 'u-turn' {
  if (modifier === 'uturn') return 'u-turn';

  if (modifier === 'sharp left') return 'sharp-left';
  if (modifier === 'sharp right') return 'sharp-right';
  if (modifier === 'slight left') return 'slight-left';
  if (modifier === 'slight right') return 'slight-right';
  if (modifier === 'left') return 'left';
  if (modifier === 'right') return 'right';

  return 'straight';
}

export function useNavigation(): UseNavigationReturn {
  const [state, setState] = useState<NavigationState>({
    currentLocation: null,
    currentSpeed: 0,
    route: null,
    currentStepIndex: 0,
    currentStep: null,
    distanceToNextManeuver: 0,
    totalDistanceRemaining: 0,
    totalTimeRemaining: 0,
    lanes: null,
    isNavigating: false,
    error: null,
  });

  const destinationRef = useRef<Coordinate | null>(null);
  const watchIdRef = useRef<number | null>(null);

  /**
   * Start GPS location tracking
   */
  useEffect(() => {
    if (!state.isNavigating) return;

    // Watch position with high accuracy
    const watchId = Geolocation.watchPosition(
      position => {
        const location: Coordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Update current speed (from GPS for now, OBD2 later)
        const gpsSpeed = position.coords.speed
          ? (position.coords.speed * 3.6) // Convert m/s to km/h
          : 0;

        setState(prev => ({
          ...prev,
          currentLocation: location,
          currentSpeed: Math.max(gpsSpeed, prev.currentSpeed), // Prevent negative speeds
        }));
      },
      error => {
        console.error('GPS error:', error);
        setState(prev => ({
          ...prev,
          error: 'GPS tracking failed',
        }));
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // Update every 5 meters
        interval: 1000, // Update every second
        fastestInterval: 500,
      },
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [state.isNavigating]);

  /**
   * Update navigation state when location or route changes
   */
  useEffect(() => {
    if (!state.currentLocation || !state.route || !state.isNavigating) return;

    const currentStep = state.route.legs[0].steps[state.currentStepIndex];
    if (!currentStep) return;

    // Calculate distance to next maneuver
    const maneuverLocation: Coordinate = {
      longitude: currentStep.maneuver.location[0],
      latitude: currentStep.maneuver.location[1],
    };

    const distanceToManeuver = calculateDistance(
      state.currentLocation,
      maneuverLocation,
    );

    // Get lane guidance for this step
    const laneGuidance = osrmService.getLaneGuidance(
      currentStep,
      distanceToManeuver,
    );

    // Calculate total remaining distance and time
    let totalDistance = 0;
    let totalTime = 0;
    for (let i = state.currentStepIndex; i < state.route.legs[0].steps.length; i++) {
      const step = state.route.legs[0].steps[i];
      totalDistance += step.distance;
      totalTime += step.duration;
    }

    setState(prev => ({
      ...prev,
      currentStep,
      distanceToNextManeuver: distanceToManeuver,
      totalDistanceRemaining: totalDistance,
      totalTimeRemaining: totalTime,
      lanes: laneGuidance,
    }));

    // Auto-advance to next step when close to current maneuver
    if (distanceToManeuver < 20 && state.currentStepIndex < state.route.legs[0].steps.length - 1) {
      setState(prev => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
      }));
    }
  }, [state.currentLocation, state.route, state.currentStepIndex, state.isNavigating]);

  /**
   * Start navigation to destination
   */
  const startNavigation = async (destination: Coordinate) => {
    try {
      setState(prev => ({...prev, error: null}));

      // Get current location first
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          Geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
          });
        },
      );

      const origin: Coordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Fetch route from OSRM
      const routeResponse = await osrmService.getRoute(origin, destination);

      if (!routeResponse.routes || routeResponse.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = routeResponse.routes[0];

      setState(prev => ({
        ...prev,
        currentLocation: origin,
        route,
        currentStepIndex: 0,
        currentStep: route.legs[0].steps[0],
        isNavigating: true,
      }));

      destinationRef.current = destination;
    } catch (error) {
      console.error('Navigation start error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start navigation',
      }));
    }
  };

  /**
   * Stop navigation
   */
  const stopNavigation = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setState({
      currentLocation: null,
      currentSpeed: 0,
      route: null,
      currentStepIndex: 0,
      currentStep: null,
      distanceToNextManeuver: 0,
      totalDistanceRemaining: 0,
      totalTimeRemaining: 0,
      lanes: null,
      isNavigating: false,
      error: null,
    });

    destinationRef.current = null;
  };

  /**
   * Recalculate route from current location
   */
  const recalculateRoute = async () => {
    if (!destinationRef.current || !state.currentLocation) return;

    try {
      const routeResponse = await osrmService.getRoute(
        state.currentLocation,
        destinationRef.current,
      );

      if (!routeResponse.routes || routeResponse.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = routeResponse.routes[0];

      setState(prev => ({
        ...prev,
        route,
        currentStepIndex: 0,
        currentStep: route.legs[0].steps[0],
      }));
    } catch (error) {
      console.error('Route recalculation error:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to recalculate route',
      }));
    }
  };

  return {
    ...state,
    startNavigation,
    stopNavigation,
    recalculateRoute,
  };
}
