const router = require('express').Router();
const { auth } = require('../middleware/auth');

// OpenStreetMap's Nominatim asks callers to identify themselves. Browsers can't set a
// User-Agent, so the lookup is proxied here instead of being called from the page.
const USER_AGENT = 'FoodHub-Ordering/1.0 (self-hosted food ordering project)';
const TIMEOUT_MS = 8000;

// Turn Nominatim's address object into one delivery-friendly line.
function formatAddress(data) {
  const a = data.address || {};
  const parts = [
    [a.house_number, a.road].filter(Boolean).join(' '),
    a.neighbourhood || a.suburb || a.hamlet,
    a.city || a.town || a.village || a.municipality || a.county,
    a.state,
    a.postcode,
  ].filter(Boolean);

  const seen = new Set();
  const unique = parts.filter((p) => {
    const key = p.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.join(', ') || data.display_name || '';
}

router.get('/geocode/reverse', auth, async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return res.status(400).json({ message: 'Invalid coordinates' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=${lat}&lon=${lon}`;
    const r = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
      signal: controller.signal,
    });
    if (!r.ok) return res.status(502).json({ message: `Address service returned ${r.status}` });

    const data = await r.json();
    if (data.error) return res.status(404).json({ message: 'No address found at that spot' });

    res.json({ address: formatAddress(data), lat, lon });
  } catch (err) {
    res.status(502).json({
      message: err.name === 'AbortError'
        ? 'Address lookup timed out — type your address instead'
        : 'Could not reach the address service — type your address instead',
    });
  } finally {
    clearTimeout(timer);
  }
});

module.exports = router;
