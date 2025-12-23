/**
 * Navigation Hook
 * Manages navigation state and updates HUD display
 */

import {useState, useEffect, useCallback} from 'react';
import {hereApiService, RouteRequest} from '../services/HereApiService';
import type {NavigationData} from '../types/navigation';

export interface NavigationState {
  isNavigating: boolean;
  navigationData: NavigationData | null;
  currentLocation: {lat: number; lng: number} | null;
  destination: {lat: number; lng: number} | null;
  error: string | null;
}

export interface UseNavigationReturn extends NavigationState {
  startNavigation: (destination: {lat: number; lng: number}) => Promise<void>;
  stopNavigation: () => void;
  updateCurrentSpeed: (speed: number) => void;
  updateLocation: (location: {lat: number; lng: number}) => void;
}

export function useNavigation(): UseNavigationReturn {
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    navigationData: null,
    currentLocation: null,
    destination: null,
    error: null,
  });

  /**
   * Start navigation to destination
   */
  const startNavigation = useCallback(
    async (destination: {lat: number; lng: number}) => {
      if (!state.currentLocation) {
        setState(prev => ({
          ...prev,
          error: 'Current location not available',
        }));
        return;
      }

      try {
        setState(prev => ({...prev, error: null, destination}));

        const request: RouteRequest = {
          origin: state.currentLocation,
          destination,
        };

        const route = await hereApiService.getRoute(request);
        const navigationData = hereApiService.parseRouteToNavigationData(
          route,
          0, // Initial speed, will be updated by OBD2
        );

        setState(prev => ({
          ...prev,
          isNavigating: true,
          navigationData,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Navigation failed',
        }));
      }
    },
    [state.currentLocation],
  );

  /**
   * Stop navigation
   */
  const stopNavigation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isNavigating: false,
      navigationData: null,
      destination: null,
    }));
  }, []);

  /**
   * Update current speed (from OBD2)
   */
  const updateCurrentSpeed = useCallback((speed: number) => {
    setState(prev => ({
      ...prev,
      navigationData: prev.navigationData
        ? {...prev.navigationData, currentSpeed: speed}
        : null,
    }));
  }, []);

  /**
   * Update current location (from GPS)
   */
  const updateLocation = useCallback(
    (location: {lat: number; lng: number}) => {
      setState(prev => ({...prev, currentLocation: location}));

      // If navigating, recalculate route if user deviated significantly
      // TODO: Implement route recalculation logic
    },
    [],
  );

  return {
    ...state,
    startNavigation,
    stopNavigation,
    updateCurrentSpeed,
    updateLocation,
  };
}
