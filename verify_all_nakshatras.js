'use strict';
// Comprehensive nakshatra verification — hits live API with 27 dates (one per ~2 days)
// to cycle through all 27 nakshatras (Moon takes ~27.3 days for one full cycle).
// Checks: non-null, no-space format, valid name.

const https = require('https');

const API_URL = 'https://backend-production-6068.up.railway.app/api/kundali/generate-public';

const VALID_NAKSHATRAS = new Set([
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','PurvaPhalguni','UttaraPhalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','PurvaAshadha','UttaraAshadha','Shravana','Dhanishtha',
  'Shatabhisha','PurvaBhadrapada','UttaraBhadrapada','Revati'
]);

// Previously space-named (bug-prone) nakshatras
const SPACE_PRONE = new Set([
  'PurvaPhalguni','UttaraPhalguni','PurvaAshadha','UttaraAshadha',
  'PurvaBhadrapada','UttaraBhadrapada'
]);

// Test cases: spread ~2 days apart over Jan-Feb 1990 to cycle through all 27 nakshatras.
// A few known cases added for specific verification.
const TESTS = [
  // Known confirmed cases
  { name:'Hemant',   dob:'1961-01-31', time:'23:47:00', place:'Jaipur, Rajasthan, India' },
  { name:'Swechha',  dob:'1992-02-06', time:'19:00:00', place:'Sri Ganganagar, Rajasthan, India' },
  // Spread across 1990 Jan-Feb (~every 2 days) to hit all nakshatras
  { name:'T01', dob:'1990-01-01', time:'12:00:00', place:'Delhi, India' },
  { name:'T02', dob:'1990-01-03', time:'12:00:00', place:'Delhi, India' },
  { name:'T03', dob:'1990-01-05', time:'12:00:00', place:'Delhi, India' },
  { name:'T04', dob:'1990-01-07', time:'12:00:00', place:'Delhi, India' },
  { name:'T05', dob:'1990-01-09', time:'12:00:00', place:'Delhi, India' },
  { name:'T06', dob:'1990-01-11', time:'12:00:00', place:'Delhi, India' },
  { name:'T07', dob:'1990-01-13', time:'12:00:00', place:'Delhi, India' },
  { name:'T08', dob:'1990-01-15', time:'12:00:00', place:'Delhi, India' },
  { name:'T09', dob:'1990-01-17', time:'12:00:00', place:'Delhi, India' },
  { name:'T10', dob:'1990-01-19', time:'12:00:00', place:'Delhi, India' },
  { name:'T11', dob:'1990-01-21', time:'12:00:00', place:'Delhi, India' },
  { name:'T12', dob:'1990-01-23', time:'12:00:00', place:'Delhi, India' },
  { name:'T13', dob:'1990-01-25', time:'12:00:00', place:'Delhi, India' },
  { name:'T14', dob:'1990-01-27', time:'12:00:00', place:'Delhi, India' },
  { name:'T15', dob:'1990-01-29', time:'12:00:00', place:'Delhi, India' },
  { name:'T16', dob:'1990-01-31', time:'12:00:00', place:'Delhi, India' },
  { name:'T17', dob:'1990-02-02', time:'12:00:00', place:'Delhi, India' },
  { name:'T18', dob:'1990-02-04', time:'12:00:00', place:'Delhi, India' },
  { name:'T19', dob:'1990-02-06', time:'12:00:00', place:'Delhi, India' },
  { name:'T20', dob:'1990-02-08', time:'12:00:00', place:'Delhi, India' },
  { name:'T21', dob:'1990-02-10', time:'12:00:00', place:'Delhi, India' },
  { name:'T22', dob:'1990-02-12', time:'12:00:00', place:'Delhi, India' },
  { name:'T23', dob:'1990-02-14', time:'12:00:00', place:'Delhi, India' },
  { name:'T24', dob:'1990-02-16', time:'12:00:00', place:'Delhi, India' },
  { name:'T25', dob:'1990-02-18', time:'12:00:00', place:'Delhi, India' },
  { name:'T26', dob:'1990-02-20', time:'12:00:00', place:'Delhi, India' },
  { name:'T27', dob:'1990-02-22', time:'12:00:00', place:'Delhi, India' },
];

function post(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(API_URL);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: 20000,
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { resolve({ _raw: raw.slice(0, 200) }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const seen = new Set();
  let pass = 0, fail = 0, spaceFail = 0;
  const failures = [];

  console.log(`Testing ${TESTS.length} cases against live API...\n`);
  console.log('Name'.padEnd(10), 'DOB'.padEnd(12), 'Lagna'.padEnd(15), 'Nakshatra'.padEnd(22), 'Status');
  console.log('-'.repeat(75));

  for (const t of TESTS) {
    try {
      const res = await post({ name: t.name, dob: t.dob, birth_time: t.time, birth_place: t.place });
      const chart = res.chart || res.data?.chart || res.data;
      const nak = chart?.nakshatra ?? null;
      const lagna = chart?.lagna ?? '?';

      let status = '';
      if (!nak) {
        status = '❌ NULL nakshatra';
        fail++;
        failures.push(`${t.name} ${t.dob} → NULL nakshatra`);
      } else if (!VALID_NAKSHATRAS.has(nak)) {
        status = `❌ INVALID: "${nak}"`;
        fail++;
        failures.push(`${t.name} ${t.dob} → invalid nakshatra: "${nak}"`);
      } else {
        status = '✅';
        pass++;
        if (SPACE_PRONE.has(nak)) status += ` [space-prone: ${nak}]`;
        seen.add(nak);
      }

      console.log(t.name.padEnd(10), t.dob.padEnd(12), (lagna+'').padEnd(15), (nak||'null').padEnd(22), status);
    } catch (e) {
      console.log(t.name.padEnd(10), t.dob.padEnd(12), '?'.padEnd(15), 'ERROR'.padEnd(22), `❌ ${e.message}`);
      fail++;
      failures.push(`${t.name} ${t.dob} → ${e.message}`);
    }
    await sleep(600); // 600ms between calls to avoid rate limiting
  }

  console.log('\n' + '='.repeat(75));
  console.log(`RESULT: ${pass} PASS / ${fail} FAIL out of ${TESTS.length} tests`);
  console.log(`Unique nakshatras seen: ${seen.size} / 27`);
  console.log(`Space-prone nakshatras encountered: ${[...seen].filter(n => SPACE_PRONE.has(n)).join(', ') || 'none in this run'}`);

  if (failures.length) {
    console.log('\nFAILURES:');
    failures.forEach(f => console.log(' ', f));
  }

  if (seen.size < 27) {
    const missing = [...VALID_NAKSHATRAS].filter(n => !seen.has(n));
    console.log(`\nNakshatras NOT seen in this run (may need additional test dates):`);
    missing.forEach(n => console.log(' ', n, SPACE_PRONE.has(n) ? '⚠️ (was space-prone)' : ''));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
