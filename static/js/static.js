'use strict';

const PLANETS = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'];
const PLANET_ICONS = {
  Mercury: '☿', Venus: '♀', Earth: '🌍', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆',
};
const PLANET_DESCS = {
  Mercury: 'Closest to the Sun — extreme EM radiation',
  Venus:   'Dense atmosphere — high-pressure EM environment',
  Earth:   'Balanced magnetosphere — life-sustaining frequencies',
  Mars:    'Thin atmosphere — lower frequency EM activity',
  Jupiter: 'Massive magnetic field — intense wave activity',
  Saturn:  'Famous ring system — unique electromagnetic patterns',
  Uranus:  'Tilted magnetic axis — irregular wave signatures',
  Neptune: 'Farthest giant — complex deep-space EM fields',
};
const SPECTRUM_LABELS = ['electromagnetic','sound','visual'];

let currentPlanet = 'Earth';
let loading = false;

// ── DOM ──
const pillButtons = document.querySelectorAll('.planet-pill');
const planetIcon  = document.getElementById('planetIcon');
const planetName  = document.getElementById('planetName');
const planetDesc  = document.getElementById('planetDesc');
const freqBadges  = document.getElementById('freqBadges');

// ── Planet pill clicks ──
pillButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.planet === currentPlanet) return;
    currentPlanet = btn.dataset.planet;
    pillButtons.forEach(b => b.classList.toggle('active', b.dataset.planet === currentPlanet));
    loadPlanet(currentPlanet);
  });
});

// ── Strip arrows ──
document.getElementById('prevPlanet').addEventListener('click', () => {
  const i = PLANETS.indexOf(currentPlanet);
  currentPlanet = PLANETS[(i + PLANETS.length - 1) % PLANETS.length];
  syncPills();
  loadPlanet(currentPlanet);
});
document.getElementById('nextPlanet').addEventListener('click', () => {
  const i = PLANETS.indexOf(currentPlanet);
  currentPlanet = PLANETS[(i + 1) % PLANETS.length];
  syncPills();
  loadPlanet(currentPlanet);
});

function syncPills() {
  pillButtons.forEach(b => b.classList.toggle('active', b.dataset.planet === currentPlanet));
}

// ── Load planet data ──
function loadPlanet(planet) {
  if (loading) return;
  loading = true;

  // Update info bar immediately
  planetIcon.textContent = PLANET_ICONS[planet] || '🪐';
  planetName.textContent = planet;
  planetDesc.textContent = 'Loading wave data…';
  freqBadges.innerHTML   = '';

  // Show loaders
  SPECTRUM_LABELS.forEach(s => {
    document.getElementById('img-' + s).style.display    = 'none';
    document.getElementById('loader-' + s).style.display = 'flex';
    document.getElementById('badge-' + s).textContent    = '—';
  });

  fetch('/api/static-waves?planet=' + encodeURIComponent(planet))
  .then(r => {
    if (!r.ok) throw new Error('Server error ' + r.status);
    return r.json();
  })
  .then(data => {
    planetDesc.textContent = PLANET_DESCS[planet] || '';

    SPECTRUM_LABELS.forEach(s => {
      const img    = document.getElementById('img-' + s);
      const loader = document.getElementById('loader-' + s);
      const badge  = document.getElementById('badge-' + s);

      if (data.images && data.images[s]) {
        img.src = 'data:image/png;base64,' + data.images[s];
        img.onload = () => {
          loader.style.display = 'none';
          img.style.display    = 'block';
        };
      }
      // Show freq badge
      const FREQ_MAP = {
        Mercury: {electromagnetic:'5.0 Hz', sound:'4.0 Hz', visual:'6.0 Hz'},
        Venus:   {electromagnetic:'3.5 Hz', sound:'2.5 Hz', visual:'4.0 Hz'},
        Earth:   {electromagnetic:'2.0 Hz', sound:'1.5 Hz', visual:'2.5 Hz'},
        Mars:    {electromagnetic:'1.5 Hz', sound:'1.0 Hz', visual:'2.0 Hz'},
        Jupiter: {electromagnetic:'7.0 Hz', sound:'6.0 Hz', visual:'8.0 Hz'},
        Saturn:  {electromagnetic:'4.5 Hz', sound:'3.5 Hz', visual:'5.0 Hz'},
        Uranus:  {electromagnetic:'3.0 Hz', sound:'2.0 Hz', visual:'3.5 Hz'},
        Neptune: {electromagnetic:'2.5 Hz', sound:'2.0 Hz', visual:'3.0 Hz'},
      };
      if (FREQ_MAP[planet]) {
        badge.textContent = FREQ_MAP[planet][s] || '—';
      }
    });

    // Freq badges in info bar
    const FREQ_MAP = {
      Mercury: {electromagnetic:'5.0',sound:'4.0',visual:'6.0'},
      Venus:   {electromagnetic:'3.5',sound:'2.5',visual:'4.0'},
      Earth:   {electromagnetic:'2.0',sound:'1.5',visual:'2.5'},
      Mars:    {electromagnetic:'1.5',sound:'1.0',visual:'2.0'},
      Jupiter: {electromagnetic:'7.0',sound:'6.0',visual:'8.0'},
      Saturn:  {electromagnetic:'4.5',sound:'3.5',visual:'5.0'},
      Uranus:  {electromagnetic:'3.0',sound:'2.0',visual:'3.5'},
      Neptune: {electromagnetic:'2.5',sound:'2.0',visual:'3.0'},
    };
    if (FREQ_MAP[planet]) {
      ['em','sound','visual'].forEach((k,i) => {
        const key = ['electromagnetic','sound','visual'][i];
        const b = document.createElement('span');
        b.className = 'freq-badge';
        b.textContent = ['EM','Sound','Visual'][i] + ' ' + FREQ_MAP[planet][key] + ' Hz';
        freqBadges.appendChild(b);
      });
    }
  })
  .catch(err => {
    console.error(err);
    planetDesc.textContent = '⚠ Could not load data. Is Flask running?';
    SPECTRUM_LABELS.forEach(s => {
      document.getElementById('loader-' + s).innerHTML = '<span style="color:#ff6b6b;font-size:0.75rem;font-family:monospace">Render failed</span>';
    });
  })
  .finally(() => { loading = false; });
}

// ── Init ──
loadPlanet(currentPlanet);
