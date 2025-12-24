# OSRM Setup Guide for Dubai Lane Guidance

Complete guide to setting up OSRM (Open Source Routing Machine) with OpenStreetMap data for lane-by-lane navigation.

## What is OSRM?

OSRM is an open-source routing engine that processes OpenStreetMap data and provides:
- Turn-by-turn navigation
- **Lane-level guidance** (which lanes to be in for upcoming turns)
- Route optimization
- All completely FREE with no API limits

## Quick Start (Docker - Easiest)

### 1. Install Docker

```bash
# Linux
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Verify installation
docker --version
```

### 2. Download Dubai OSM Data

```bash
# Create data directory
mkdir -p ~/osrm-data
cd ~/osrm-data

# Download UAE OSM extract (includes Dubai)
wget http://download.geofabrik.de/asia/united-arab-emirates-latest.osm.pbf
```

### 3. Build OSRM Data

```bash
# Extract OSM data
docker run -t -v $(pwd):/data ghcr.io/project-osrm/osrm-backend osrm-extract -p /opt/car.lua /data/united-arab-emirates-latest.osm.pbf

# Partition data
docker run -t -v $(pwd):/data ghcr.io/project-osrm/osrm-backend osrm-partition /data/united-arab-emirates-latest.osrm

# Customize data
docker run -t -v $(pwd):/data ghcr.io/project-osrm/osrm-backend osrm-customize /data/united-arab-emirates-latest.osrm
```

### 4. Run OSRM Server

```bash
# Start OSRM routing server
docker run -t -i -p 5000:5000 -v $(pwd):/data ghcr.io/project-osrm/osrm-backend osrm-routed --algorithm mld /data/united-arab-emirates-latest.osrm
```

Server will be available at: `http://localhost:5000`

### 5. Test OSRM

```bash
# Test route from Dubai Mall to Burj Khalifa
curl "http://localhost:5000/route/v1/car/55.2744,25.1972;55.2708,25.2048?steps=true&geometries=geojson"
```

If you see JSON with `"code":"Ok"` and route data, it's working! ✅

## Update .env File

```bash
cd HUDApp
nano .env
```

Set OSRM server URL:
```
OSRM_SERVER_URL=http://localhost:5000
```

For cloud deployment, change to your server URL:
```
OSRM_SERVER_URL=https://your-osrm-server.com
```

## Lane Data Coverage

Based on testing (December 2024):
- **Sheikh Zayed Road area**: 17.3% of roads have lane data
- **Major highways**: Good coverage
- **Residential areas**: Limited coverage

**Graceful fallback**: When lane data is missing, HUD shows basic turn arrows only.

## Cloud Deployment (Optional)

### Free Options:

**Render.com** (Recommended):
1. Create account at render.com
2. Create new Web Service
3. Connect GitHub repo
4. Docker will auto-deploy
5. Free tier includes 750 hours/month

**Railway.app**:
1. Create account at railway.app
2. Deploy from Docker image
3. Free tier: $5 credit/month

**Fly.io**:
1. Create account at fly.io
2. Deploy with `fly launch`
3. Free tier includes 3 shared-cpu VMs

## Data Updates

Update OSM data monthly for latest road changes:

```bash
cd ~/osrm-data

# Download latest UAE data
wget http://download.geofabrik.de/asia/united-arab-emirates-latest.osm.pbf -O united-arab-emirates-latest.osm.pbf

# Rebuild OSRM data (repeat steps 3-4)
```

## Troubleshooting

**Server won't start:**
- Check Docker is running: `docker ps`
- Check port 5000 is available: `lsof -i :5000`

**No lane data in response:**
- Lane data is optional in OSM
- Only appears where roads have `turn:lanes` tags
- This is expected - fallback to basic arrows

**Slow routing:**
- Use MLD algorithm (default, fast)
- Ensure OSRM data is customized (step 3)

## Architecture

```
┌─────────────────────────────────┐
│  HUD App (React Native)         │
│  - OSRMService.ts               │
└──────────────┬──────────────────┘
               │ HTTP requests
┌──────────────▼──────────────────┐
│  OSRM Server (Docker)           │
│  - Port 5000                    │
│  - MLD algorithm                │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  OSM Data (UAE PBF)             │
│  - Road geometry                │
│  - Lane tags (turn:lanes)       │
│  - Updated monthly              │
└─────────────────────────────────┘
```

## Next Steps

1. ✅ OSRM server running
2. Create lane guidance UI component
3. Integrate with HUD display
4. Test on real Dubai routes
5. Deploy to cloud for remote access
