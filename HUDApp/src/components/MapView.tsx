/**
 * MapView Component
 * Displays map using MapLibre with HERE Vector Tiles
 */

import React from 'react';
import {StyleSheet} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import {hereApiService} from '../services/HereApiService';
import {HERE_CONFIG} from '../config/here.config';

// Initialize MapLibre
MapLibreGL.setAccessToken(null);

interface MapViewProps {
  currentLocation?: {lat: number; lng: number};
  destination?: {lat: number; lng: number};
  routePolyline?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  currentLocation,
  destination,
  routePolyline,
}) => {
  const tileUrl = hereApiService.getVectorTileUrl();

  return (
    <MapLibreGL.MapView
      style={styles.map}
      styleURL={{
        version: 8,
        sources: {
          'here-tiles': {
            type: 'vector',
            tiles: [tileUrl],
            minzoom: 0,
            maxzoom: 22,
          },
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#1a1a1a',
            },
          },
          {
            id: 'roads',
            type: 'line',
            source: 'here-tiles',
            'source-layer': 'roads',
            paint: {
              'line-color': '#555555',
              'line-width': 2,
            },
          },
          {
            id: 'highways',
            type: 'line',
            source: 'here-tiles',
            'source-layer': 'roads',
            filter: ['==', ['get', 'kind'], 'highway'],
            paint: {
              'line-color': '#ff9800',
              'line-width': 4,
            },
          },
          {
            id: 'labels',
            type: 'symbol',
            source: 'here-tiles',
            'source-layer': 'places',
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 12,
            },
            paint: {
              'text-color': '#ffffff',
            },
          },
        ],
      }}>
      {/* Camera position */}
      <MapLibreGL.Camera
        zoomLevel={HERE_CONFIG.DEFAULT_REGION.zoom}
        centerCoordinate={
          currentLocation
            ? [currentLocation.lng, currentLocation.lat]
            : [
                HERE_CONFIG.DEFAULT_REGION.longitude,
                HERE_CONFIG.DEFAULT_REGION.latitude,
              ]
        }
        animationDuration={1000}
      />

      {/* Current location marker */}
      {currentLocation && (
        <MapLibreGL.PointAnnotation
          id="current-location"
          coordinate={[currentLocation.lng, currentLocation.lat]}>
          <MapLibreGL.Callout title="Current Location" />
        </MapLibreGL.PointAnnotation>
      )}

      {/* Destination marker */}
      {destination && (
        <MapLibreGL.PointAnnotation
          id="destination"
          coordinate={[destination.lng, destination.lat]}>
          <MapLibreGL.Callout title="Destination" />
        </MapLibreGL.PointAnnotation>
      )}

      {/* Route line */}
      {routePolyline && (
        <MapLibreGL.ShapeSource
          id="route-source"
          shape={{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: decodePolyline(routePolyline),
            },
          }}>
          <MapLibreGL.LineLayer
            id="route-line"
            style={{
              lineColor: '#2196F3',
              lineWidth: 6,
              lineOpacity: 0.8,
            }}
          />
        </MapLibreGL.ShapeSource>
      )}
    </MapLibreGL.MapView>
  );
};

/**
 * Decode HERE flexible polyline format
 * TODO: Implement proper flexible polyline decoder
 */
function decodePolyline(polyline: string): number[][] {
  // Placeholder: Return empty array
  // Real implementation would decode HERE's flexible polyline format
  return [];
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
