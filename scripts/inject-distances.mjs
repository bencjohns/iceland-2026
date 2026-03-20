import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const distances = JSON.parse(readFileSync(join(root, 'distances.json'), 'utf8'));
const html = readFileSync(join(root, 'index.html'), 'utf8');

const oldCode = `    function haversineKm(lat1, lng1, lat2, lng2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    function getDriveInfo(cardIdA, cardIdB) {
      const a = CARD_COORDS[cardIdA], b = CARD_COORDS[cardIdB];
      if (!a || !b) return null;
      const straight = haversineKm(a.lat, a.lng, b.lat, b.lng);
      const roadKm = Math.round(straight * 1.4);
      const driveMin = Math.round(roadKm / 70 * 60);
      if (roadKm < 1) return { km: 0, minutes: 0, label: 'Same area' };
      const hrs = Math.floor(driveMin / 60);
      const mins = driveMin % 60;
      const timeStr = hrs > 0 ? (mins > 0 ? \`\${hrs}h \${mins}m\` : \`\${hrs}h\`) : \`\${mins} min\`;
      return { km: roadKm, minutes: driveMin, label: \`\${roadKm} km · \${timeStr}\` };
    }`;

const newCode = `    // Pre-computed OSRM driving distances between all card pairs
    const DRIVE_DISTANCES = ${JSON.stringify(distances)};

    function haversineKm(lat1, lng1, lat2, lng2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    function getDriveInfo(cardIdA, cardIdB) {
      // Look up pre-computed OSRM route first
      const key = cardIdA < cardIdB ? cardIdA + '|' + cardIdB : cardIdB + '|' + cardIdA;
      const cached = DRIVE_DISTANCES[key];
      if (cached) {
        if (cached.km < 1) return { km: 0, minutes: 0, label: 'Same area' };
        const hrs = Math.floor(cached.minutes / 60);
        const mins = cached.minutes % 60;
        const timeStr = hrs > 0 ? (mins > 0 ? \`\${hrs}h \${mins}m\` : \`\${hrs}h\`) : \`\${cached.minutes} min\`;
        return { km: cached.km, minutes: cached.minutes, label: \`\${cached.km} km · \${timeStr}\` };
      }
      // Fallback to haversine estimate for user-submitted cards
      const a = CARD_COORDS[cardIdA], b = CARD_COORDS[cardIdB];
      if (!a || !b) return null;
      const straight = haversineKm(a.lat, a.lng, b.lat, b.lng);
      const roadKm = Math.round(straight * 1.4);
      const driveMin = Math.round(roadKm / 70 * 60);
      if (roadKm < 1) return { km: 0, minutes: 0, label: 'Same area' };
      const hrs = Math.floor(driveMin / 60);
      const mins = driveMin % 60;
      const timeStr = hrs > 0 ? (mins > 0 ? \`\${hrs}h \${mins}m\` : \`\${hrs}h\`) : \`\${mins} min\`;
      return { km: roadKm, minutes: driveMin, label: \`~\${roadKm} km · \${timeStr}\` };
    }`;

if (!html.includes(oldCode)) {
  console.error('ERROR: Could not find old code block to replace.');
  console.error('Searching for haversineKm...');
  const idx = html.indexOf('function haversineKm');
  console.error('Found at index:', idx);
  process.exit(1);
}

const updated = html.replace(oldCode, newCode);
writeFileSync(join(root, 'index.html'), updated);
console.log('Done! getDriveInfo updated with OSRM lookup table.');
