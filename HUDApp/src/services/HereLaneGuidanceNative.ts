/**
 * React Native bridge to HERE SDK native lane guidance module
 */

import {NativeModules, NativeEventEmitter, EmitterSubscription} from 'react-native';

const {HereLaneGuidance} = NativeModules;

export interface Lane {
  directions: string[]; // e.g., ['left'], ['straight'], ['left', 'straight']
  recommended: boolean; // Should driver be in this lane?
}

export interface LaneGuidanceEvent {
  lanes: Lane[];
  distanceToManeuver: number; // meters until next turn
}

export type LaneGuidanceCallback = (event: LaneGuidanceEvent) => void;

class HereLaneGuidanceService {
  private eventEmitter: NativeEventEmitter;
  private subscription: EmitterSubscription | null = null;

  constructor() {
    this.eventEmitter = new NativeEventEmitter(HereLaneGuidance);
  }

  /**
   * Initialize HERE SDK with credentials
   */
  async initialize(accessKeyId: string, accessKeySecret: string): Promise<void> {
    return HereLaneGuidance.initializeSDK(accessKeyId, accessKeySecret);
  }

  /**
   * Start navigation from origin to destination
   */
  async startNavigation(
    origin: {lat: number; lng: number},
    destination: {lat: number; lng: number},
  ): Promise<void> {
    return HereLaneGuidance.startNavigation(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng,
    );
  }

  /**
   * Update current location (call this repeatedly during navigation)
   */
  updateLocation(
    lat: number,
    lng: number,
    speed: number,
    bearing: number,
  ): void {
    HereLaneGuidance.updateLocation(lat, lng, speed, bearing);
  }

  /**
   * Stop navigation
   */
  stopNavigation(): void {
    HereLaneGuidance.stopNavigation();
  }

  /**
   * Listen for lane guidance updates
   */
  onLaneGuidanceUpdated(callback: LaneGuidanceCallback): EmitterSubscription {
    this.subscription = this.eventEmitter.addListener(
      'onLaneGuidanceUpdated',
      callback,
    );
    return this.subscription;
  }

  /**
   * Remove lane guidance listener
   */
  removeListener(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }
}

export const hereLaneGuidanceService = new HereLaneGuidanceService();
