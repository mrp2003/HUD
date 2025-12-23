/**
 * Tile Cache Service
 * Manages offline map tile downloads and caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {HERE_CONFIG} from '../config/here.config';

export interface TileCacheProgress {
  totalTiles: number;
  downloadedTiles: number;
  percentComplete: number;
  currentZoom: number;
}

class TileCacheService {
  private cacheDir: string;
  private apiKey: string;

  constructor() {
    this.cacheDir = `${RNFS.DocumentDirectoryPath}/map_tiles`;
    this.apiKey = HERE_CONFIG.API_KEY;
  }

  /**
   * Initialize cache directory
   */
  async initialize(): Promise<void> {
    const exists = await RNFS.exists(this.cacheDir);
    if (!exists) {
      await RNFS.mkdir(this.cacheDir);
    }
  }

  /**
   * Download offline tiles for UAE/Dubai region
   */
  async downloadRegionTiles(
    onProgress?: (progress: TileCacheProgress) => void,
  ): Promise<void> {
    await this.initialize();

    const {boundingBox, zoomLevels} = HERE_CONFIG.CACHE_SETTINGS;
    let totalTiles = 0;
    let downloadedTiles = 0;

    // Calculate total tiles needed
    for (const zoom of zoomLevels) {
      const tiles = this.getTilesForBoundingBox(boundingBox, zoom);
      totalTiles += tiles.length;
    }

    // Download tiles for each zoom level
    for (const zoom of zoomLevels) {
      const tiles = this.getTilesForBoundingBox(boundingBox, zoom);

      for (const tile of tiles) {
        await this.downloadTile(tile.x, tile.y, zoom);
        downloadedTiles++;

        if (onProgress) {
          onProgress({
            totalTiles,
            downloadedTiles,
            percentComplete: (downloadedTiles / totalTiles) * 100,
            currentZoom: zoom,
          });
        }
      }
    }

    // Mark download as complete
    await AsyncStorage.setItem('tiles_downloaded', 'true');
    await AsyncStorage.setItem(
      'tiles_download_date',
      new Date().toISOString(),
    );
  }

  /**
   * Download a single tile
   */
  private async downloadTile(
    x: number,
    y: number,
    z: number,
  ): Promise<void> {
    const tilePath = `${this.cacheDir}/${z}/${x}/${y}.mvt`;

    // Check if tile already exists
    const exists = await RNFS.exists(tilePath);
    if (exists) {
      return;
    }

    // Create directory structure
    const dir = `${this.cacheDir}/${z}/${x}`;
    const dirExists = await RNFS.exists(dir);
    if (!dirExists) {
      await RNFS.mkdir(dir);
    }

    // Download tile
    const url = `${HERE_CONFIG.VECTOR_TILE_API}/${z}/${x}/${y}/omv?apiKey=${this.apiKey}`;

    try {
      await RNFS.downloadFile({
        fromUrl: url,
        toFile: tilePath,
      }).promise;
    } catch (error) {
      console.error(`Failed to download tile ${z}/${x}/${y}:`, error);
    }
  }

  /**
   * Calculate tile coordinates for a bounding box at a given zoom level
   */
  private getTilesForBoundingBox(
    bbox: {north: number; south: number; east: number; west: number},
    zoom: number,
  ): Array<{x: number; y: number}> {
    const tiles: Array<{x: number; y: number}> = [];

    const minTile = this.latLngToTile(bbox.north, bbox.west, zoom);
    const maxTile = this.latLngToTile(bbox.south, bbox.east, zoom);

    for (let x = minTile.x; x <= maxTile.x; x++) {
      for (let y = minTile.y; y <= maxTile.y; y++) {
        tiles.push({x, y});
      }
    }

    return tiles;
  }

  /**
   * Convert lat/lng to tile coordinates
   */
  private latLngToTile(
    lat: number,
    lng: number,
    zoom: number,
  ): {x: number; y: number} {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lng + 180) / 360) * n);
    const y = Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
        ) /
          Math.PI) /
        2) *
        n,
    );

    return {x, y};
  }

  /**
   * Check if tiles are already downloaded
   */
  async isTilesDownloaded(): Promise<boolean> {
    const downloaded = await AsyncStorage.getItem('tiles_downloaded');
    return downloaded === 'true';
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    downloaded: boolean;
    downloadDate?: string;
    cacheSizeMB: number;
  }> {
    const downloaded = await this.isTilesDownloaded();
    const downloadDate = await AsyncStorage.getItem('tiles_download_date');

    let cacheSizeMB = 0;
    try {
      const exists = await RNFS.exists(this.cacheDir);
      if (exists) {
        const files = await RNFS.readDir(this.cacheDir);
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        cacheSizeMB = totalSize / (1024 * 1024);
      }
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    }

    return {
      downloaded,
      downloadDate: downloadDate || undefined,
      cacheSizeMB,
    };
  }

  /**
   * Clear tile cache
   */
  async clearCache(): Promise<void> {
    const exists = await RNFS.exists(this.cacheDir);
    if (exists) {
      await RNFS.unlink(this.cacheDir);
    }
    await AsyncStorage.removeItem('tiles_downloaded');
    await AsyncStorage.removeItem('tiles_download_date');
  }
}

export const tileCacheService = new TileCacheService();
