export type TurnDirection = 'left' | 'right' | 'straight' | 'slight-left' | 'slight-right' | 'sharp-left' | 'sharp-right' | 'u-turn';

export type LaneDirection = 'left' | 'straight' | 'right' | 'slight-left' | 'slight-right';

export interface Lane {
  directions: LaneDirection[];
  active: boolean; // Should user be in this lane?
}

export interface NavigationData {
  currentSpeed: number; // km/h from OBD2
  speedLimit?: number; // speed limit for current road
  nextTurnDirection: TurnDirection;
  nextTurnDistance: number; // meters
  nextTurnStreetName: string;
  timeRemaining: number; // minutes
  lanes: Lane[];
}
