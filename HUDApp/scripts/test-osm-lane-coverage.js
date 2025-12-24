#!/usr/bin/env node

/**
 * OSM Lane Coverage Test Script
 *
 * Tests OpenStreetMap lane guidance coverage for Dubai routes.
 * Queries Overpass API to check which roads have turn:lanes data.
 *
 * Usage:
 *   node scripts/test-osm-lane-coverage.js
 */

const https = require('https');

// Dubai test areas (add your own routes here)
const TEST_AREAS = {
  'Dubai City Center': {
    // Bounding box: [south, west, north, east]
    bbox: [25.1800, 55.2400, 25.2400, 55.3200],
    description: 'Downtown Dubai, Dubai Mall, Burj Khalifa area'
  },
  'Sheikh Zayed Road': {
    bbox: [25.0800, 55.1400, 25.2200, 55.2800],
    description: 'Main highway E11 (Sheikh Zayed Road)'
  },
  'Dubai Marina': {
    bbox: [25.0700, 55.1200, 25.1000, 55.1500],
    description: 'Dubai Marina and JBR area'
  },
  'Business Bay': {
    bbox: [25.1800, 55.2500, 25.2000, 55.2800],
    description: 'Business Bay district'
  },
  'Deira': {
    bbox: [25.2600, 55.3000, 25.2900, 55.3400],
    description: 'Deira old city area'
  }
};

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

/**
 * Query Overpass API
 */
function queryOverpass(query) {
  return new Promise((resolve, reject) => {
    const postData = `data=${encodeURIComponent(query)}`;

    const options = {
      hostname: 'overpass-api.de',
      port: 443,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Count total roads in area
 */
async function countTotalRoads(bbox) {
  const [south, west, north, east] = bbox;
  const query = `
    [out:json][timeout:25];
    (
      way["highway"~"motorway|trunk|primary|secondary|tertiary"](${south},${west},${north},${east});
    );
    out count;
  `;

  const result = await queryOverpass(query);
  return result.elements[0]?.tags?.ways || 0;
}

/**
 * Count roads with lane data
 */
async function countRoadsWithLanes(bbox) {
  const [south, west, north, east] = bbox;
  const query = `
    [out:json][timeout:25];
    (
      way["highway"~"motorway|trunk|primary|secondary|tertiary"]["turn:lanes"](${south},${west},${north},${east});
    );
    out count;
  `;

  const result = await queryOverpass(query);
  return result.elements[0]?.tags?.ways || 0;
}

/**
 * Get sample roads with lane data
 */
async function getSampleRoadsWithLanes(bbox, limit = 5) {
  const [south, west, north, east] = bbox;
  const query = `
    [out:json][timeout:25];
    (
      way["highway"~"motorway|trunk|primary|secondary|tertiary"]["turn:lanes"](${south},${west},${north},${east});
    );
    out body ${limit};
  `;

  const result = await queryOverpass(query);
  return result.elements || [];
}

/**
 * Format percentage with color
 */
function formatPercentage(percentage) {
  if (percentage >= 25) return `${colors.green}${percentage.toFixed(1)}%${colors.reset}`;
  if (percentage >= 15) return `${colors.yellow}${percentage.toFixed(1)}%${colors.reset}`;
  return `${colors.red}${percentage.toFixed(1)}%${colors.reset}`;
}

/**
 * Test coverage for a specific area
 */
async function testArea(name, config) {
  console.log(`\n${colors.bright}${colors.cyan}Testing: ${name}${colors.reset}`);
  console.log(`${colors.blue}ℹ ${config.description}${colors.reset}`);

  try {
    // Count total roads
    process.stdout.write('  Counting total roads... ');
    const totalRoads = await countTotalRoads(config.bbox);
    console.log(`${colors.bright}${totalRoads}${colors.reset} major roads`);

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Count roads with lane data
    process.stdout.write('  Counting roads with lane data... ');
    const roadsWithLanes = await countRoadsWithLanes(config.bbox);
    console.log(`${colors.bright}${roadsWithLanes}${colors.reset} roads`);

    // Calculate coverage
    const coverage = totalRoads > 0 ? (roadsWithLanes / totalRoads) * 100 : 0;
    console.log(`  ${colors.bright}Coverage: ${formatPercentage(coverage)}${colors.reset}`);

    // Get sample roads
    if (roadsWithLanes > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      process.stdout.write('  Fetching sample roads... ');
      const samples = await getSampleRoadsWithLanes(config.bbox, 3);
      console.log(`${colors.green}✓${colors.reset}`);

      console.log(`\n  ${colors.bright}Sample roads with lane data:${colors.reset}`);
      samples.forEach((road, idx) => {
        const name = road.tags?.name || 'Unnamed road';
        const highway = road.tags?.highway || 'unknown';
        const turnLanes = road.tags['turn:lanes'] || road.tags['turn:lanes:forward'] || 'N/A';
        console.log(`    ${idx + 1}. ${colors.bright}${name}${colors.reset} (${highway})`);
        console.log(`       Lanes: ${colors.yellow}${turnLanes}${colors.reset}`);
      });
    }

    return { totalRoads, roadsWithLanes, coverage };
  } catch (error) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    return { totalRoads: 0, roadsWithLanes: 0, coverage: 0, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║   OSM Lane Coverage Test - Dubai Routes          ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚═══════════════════════════════════════════════════╝${colors.reset}`);

  console.log(`\n${colors.blue}ℹ Testing ${Object.keys(TEST_AREAS).length} areas in Dubai...${colors.reset}`);
  console.log(`${colors.blue}ℹ This will take ~${Object.keys(TEST_AREAS).length * 4} seconds (rate limiting)${colors.reset}\n`);

  const results = {};

  for (const [name, config] of Object.entries(TEST_AREAS)) {
    results[name] = await testArea(name, config);
    // Rate limiting delay between areas
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Summary
  console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}SUMMARY${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

  let totalAllRoads = 0;
  let totalAllLanes = 0;

  Object.entries(results).forEach(([name, data]) => {
    if (!data.error) {
      totalAllRoads += data.totalRoads;
      totalAllLanes += data.roadsWithLanes;
      console.log(`  ${colors.bright}${name}:${colors.reset} ${formatPercentage(data.coverage)} (${data.roadsWithLanes}/${data.totalRoads})`);
    } else {
      console.log(`  ${colors.bright}${name}:${colors.reset} ${colors.red}Error${colors.reset}`);
    }
  });

  const overallCoverage = totalAllRoads > 0 ? (totalAllLanes / totalAllRoads) * 100 : 0;

  console.log(`\n  ${colors.bright}${colors.cyan}Overall Dubai Coverage: ${formatPercentage(overallCoverage)}${colors.reset}`);
  console.log(`  ${colors.bright}Total: ${totalAllLanes}/${totalAllRoads} major roads${colors.reset}`);

  // Verdict
  console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}VERDICT${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

  if (overallCoverage >= 25) {
    console.log(`  ${colors.green}✓ EXCELLENT${colors.reset} - OSM lane guidance viable for Dubai!`);
    console.log(`    Coverage is better than expected. You can build with OSM.`);
  } else if (overallCoverage >= 15) {
    console.log(`  ${colors.yellow}✓ GOOD${colors.reset} - OSM lane guidance usable with fallback.`);
    console.log(`    Lane guidance on major highways, basic navigation elsewhere.`);
  } else if (overallCoverage >= 5) {
    console.log(`  ${colors.yellow}⚠ LIMITED${colors.reset} - OSM has some coverage.`);
    console.log(`    Useful for main highways only. Need commercial solution for full coverage.`);
  } else {
    console.log(`  ${colors.red}✗ POOR${colors.reset} - OSM coverage too low for Dubai.`);
    console.log(`    Consider HERE Navigate or Mapbox Navigation SDK instead.`);
  }

  console.log(`\n${colors.blue}ℹ Next steps:${colors.reset}`);
  console.log(`  1. Check specific routes you drive frequently`);
  console.log(`  2. Edit TEST_AREAS in this script to add your routes`);
  console.log(`  3. Run again to test your actual driving areas\n`);
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
